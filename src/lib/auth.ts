import { EDGE_FUNCTIONS, isSupabaseConfigured, supabase } from "./supabaseClient";
import { rarezy } from "./store";

/**
 * True until real Supabase project keys are set in `.env.local` (see
 * `.env.example`). In demo mode every step of the login/signup flow still
 * works end-to-end — codes/usernames/passwords aren't actually checked
 * server-side — so the UI can be built and reviewed before the backend is
 * connected. Nothing about the UI changes when this flips to false; only
 * these functions start talking to Supabase for real.
 */
export const AUTH_DEMO_MODE = !isSupabaseConfigured;

async function invokeEdgeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke(name, { body });
  if (error) throw error;
  return data as T;
}

/**
 * Loads `profiles`/`sellers` for an already-authenticated Supabase user id
 * and populates `rarezy.currentUser` from it — the same lookups
 * `signInWithPassword` does, shared with `restoreSession` so a page reload
 * ends up in exactly the same state as a fresh login rather than silently
 * dropping back to the guest shopper nav.
 */
async function hydrateFromUserId(userId: string, fallbackUsername: string) {
  // `is_admin` is server-enforced (see the `protect_is_admin` trigger in
  // the profiles migration) — a normal user can never set this on
  // themselves, so trusting whatever the row says here is safe.
  const { data: profile } = await supabase!
    .from("profiles")
    .select("username, is_admin, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  // Owning a `sellers` row at all (any application status) is what routes
  // this login into the separate seller dashboard rather than the shopper
  // nav — checked here so it's known before the first render.
  const { data: sellerRow } = await supabase!.from("sellers").select("id").eq("owner_id", userId).maybeSingle();
  rarezy.signUp(profile?.username ?? fallbackUsername, {
    isAdmin: profile?.is_admin ?? false,
    isSeller: !!sellerRow,
    id: userId,
    avatarUrl: profile?.avatar_url ?? undefined,
  });
}

/** Everything the account settings page can show/edit, beyond what's already in `AccountUser`. */
export type ProfileDetails = {
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
};

export const auth = {
  async sendVerificationCode(email: string) {
    if (AUTH_DEMO_MODE) return;
    await invokeEdgeFunction(EDGE_FUNCTIONS.sendVerificationCode, { email });
  },

  async verifyCode(email: string, code: string) {
    if (AUTH_DEMO_MODE) return code.trim().length === 6;
    const res = await invokeEdgeFunction<{ ok: boolean }>(EDGE_FUNCTIONS.verifyCode, { email, code });
    return res.ok;
  },

  async checkUsernameAvailable(username: string) {
    if (AUTH_DEMO_MODE) return true;
    const res = await invokeEdgeFunction<{ available: boolean }>(EDGE_FUNCTIONS.checkUsername, {
      username,
    });
    return res.available;
  },

  async signUpWithPassword(params: { email: string; username: string; password: string }) {
    if (AUTH_DEMO_MODE) {
      rarezy.signUp(params.username);
      return;
    }
    const { data, error } = await supabase!.auth.signUp({
      email: params.email,
      password: params.password,
    });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase!
        .from("profiles")
        .insert({ id: data.user.id, username: params.username, email: params.email });
      if (profileError) throw profileError;
      rarezy.signUp(params.username, { id: data.user.id });
    }
  },

  /** Kicks off Stripe Identity's hosted ID + proof-of-address check, returning the URL to send the user to. */
  async startIdentityVerification(returnUrl: string) {
    if (AUTH_DEMO_MODE) return null;
    const { data: sessionData } = await supabase!.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Not signed in");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${EDGE_FUNCTIONS.createIdentitySession}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl }),
      },
    );
    const payload = await res.json();
    if (payload.error) throw new Error(payload.error);
    return payload.url as string;
  },

  async signInWithPassword(identifier: string, password: string) {
    if (AUTH_DEMO_MODE) {
      rarezy.signUp(identifier);
      return;
    }

    let email = identifier;
    if (!identifier.includes("@")) {
      const { data } = await supabase!
        .from("profiles")
        .select("email")
        .ilike("username", identifier)
        .maybeSingle();
      if (!data) throw new Error("No account found with that username.");
      email = data.email;
    }

    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await hydrateFromUserId(data.user.id, identifier);
  },

  /**
   * Called once on app boot. Supabase persists its own session in
   * localStorage independently of `rarezy.currentUser` (plain in-memory
   * app state) — without this, a page reload or direct URL visit while
   * already signed in would leave the Supabase client authenticated but
   * the app itself thinking the visitor is a logged-out guest, breaking
   * the seller/admin dashboards' gating on every refresh.
   */
  async restoreSession() {
    if (AUTH_DEMO_MODE) return;
    const { data } = await supabase!.auth.getSession();
    const user = data.session?.user;
    if (user) await hydrateFromUserId(user.id, user.email ?? "");
  },

  async signOut() {
    if (!AUTH_DEMO_MODE) await supabase!.auth.signOut();
    rarezy.logOut();
  },

  async fetchProfileDetails(userId: string): Promise<ProfileDetails | null> {
    if (AUTH_DEMO_MODE) return null;
    const { data, error } = await supabase!
      .from("profiles")
      .select("email, phone, date_of_birth, address_line1, address_line2, city, postcode, country")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      postcode: data.postcode,
      country: data.country,
    };
  },

  /** Username, phone, date of birth and address — everything editable that isn't email or password (those go through Supabase Auth directly, below). */
  async updateProfileFields(
    userId: string,
    fields: {
      username?: string;
      phone?: string | null;
      dateOfBirth?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city?: string | null;
      postcode?: string | null;
      country?: string | null;
    },
  ) {
    if (AUTH_DEMO_MODE) {
      if (fields.username) rarezy.updateCurrentUser({ username: fields.username });
      return;
    }
    const patch: Record<string, unknown> = {};
    if (fields.username !== undefined) patch.username = fields.username;
    if (fields.phone !== undefined) patch.phone = fields.phone;
    if (fields.dateOfBirth !== undefined) patch.date_of_birth = fields.dateOfBirth;
    if (fields.addressLine1 !== undefined) patch.address_line1 = fields.addressLine1;
    if (fields.addressLine2 !== undefined) patch.address_line2 = fields.addressLine2;
    if (fields.city !== undefined) patch.city = fields.city;
    if (fields.postcode !== undefined) patch.postcode = fields.postcode;
    if (fields.country !== undefined) patch.country = fields.country;

    const { error } = await supabase!.from("profiles").update(patch).eq("id", userId);
    if (error) throw error;
    if (fields.username) rarezy.updateCurrentUser({ username: fields.username });
  },

  /** Uploads a new profile picture, replacing any previous one at the same path, and saves the public URL onto the profile row. */
  async uploadAvatar(userId: string, file: File) {
    if (AUTH_DEMO_MODE) return null;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase!.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    const { data: publicUrl } = supabase!.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new picture shows immediately — same path, new content.
    const url = `${publicUrl.publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabase!.from("profiles").update({ avatar_url: url }).eq("id", userId);
    if (updateError) throw updateError;
    rarezy.updateCurrentUser({ avatarUrl: url });
    return url;
  },

  /** Starts Supabase's double-opt-in email change — the address only actually changes once the confirmation link is clicked, at which point `profiles.email` syncs automatically (see the `sync_profile_email` trigger). */
  async updateEmail(newEmail: string) {
    if (AUTH_DEMO_MODE) return;
    const { error } = await supabase!.auth.updateUser({ email: newEmail });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    if (AUTH_DEMO_MODE) return;
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};
