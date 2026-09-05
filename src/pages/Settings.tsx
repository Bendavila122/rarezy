import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Check, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { auth, type ProfileDetails } from "@/lib/auth";
import { AccountRequired } from "@/components/AccountRequired";
import { AccountLinkRow } from "@/components/AccountLinkRow";
import { FieldGroup, FieldInput, FieldRow, PasswordFieldInput, fieldInputCls } from "@/components/AuthField";

const COUNTRIES = ["United Kingdom", "Ireland", "United States", "France", "Germany", "Spain", "Italy", "Other"];

/** A save bar under a `FieldGroup` — every group here saves independently, so changing your address never risks also (mis)submitting a password change. */
function SaveBar({
  onSave,
  saving,
  saved,
  error,
  label = "Save",
}: {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
  label?: string;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="press flex-1 rounded-2xl bg-mint py-3.5 text-[0.85rem] font-semibold tracking-tight text-brand-deep disabled:opacity-50"
        >
          {saving ? "Saving…" : label}
        </button>
        {saved && (
          <span className="flex shrink-0 items-center gap-1 text-[0.78rem] text-mint">
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> Saved
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-[0.78rem] text-red-400">{error}</p>}
    </div>
  );
}

export function Settings() {
  const { currentUser } = useRarezy();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [details, setDetails] = useState<ProfileDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("United Kingdom");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoadingDetails(false);
      return;
    }
    auth
      .fetchProfileDetails(currentUser.id)
      .then((d) => {
        if (!d) return;
        setDetails(d);
        setPhone(d.phone ?? "");
        setDateOfBirth(d.dateOfBirth ?? "");
        setAddressLine1(d.addressLine1 ?? "");
        setAddressLine2(d.addressLine2 ?? "");
        setCity(d.city ?? "");
        setPostcode(d.postcode ?? "");
        setCountry(d.country ?? "United Kingdom");
      })
      .finally(() => setLoadingDetails(false));
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <AccountRequired title="Create an account" body="Sign in to manage your profile and settings." />
    );
  }

  const pickAvatar = () => fileRef.current?.click();

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !currentUser.id) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      await auth.uploadAvatar(currentUser.id, file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!currentUser.id) return;
    if (!username.trim()) {
      setProfileError("Username can't be empty.");
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      if (username.trim() !== currentUser.username) {
        const available = await auth.checkUsernameAvailable(username.trim());
        if (!available) throw new Error("That username is already taken.");
      }
      await auth.updateProfileFields(currentUser.id, {
        username: username.trim(),
        phone: phone.trim() || null,
        dateOfBirth: dateOfBirth || null,
        addressLine1: addressLine1.trim() || null,
        addressLine2: addressLine2.trim() || null,
        city: city.trim() || null,
        postcode: postcode.trim() || null,
        country: country || null,
      });
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Couldn't save those details.");
    } finally {
      setProfileSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailSaving(true);
    setEmailError(null);
    setEmailSaved(false);
    try {
      await auth.updateEmail(newEmail.trim());
      setEmailSaved(true);
      setNewEmail("");
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Couldn't start that email change.");
    } finally {
      setEmailSaving(false);
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSaved(false);
    try {
      await auth.updatePassword(newPassword);
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Couldn't update your password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const logOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/account" className="text-[0.72rem] text-muted underline underline-offset-4">
        ← Account
      </Link>
      <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Settings</h1>
      <p className="mt-2 text-[0.85rem] text-muted">Manage your profile, contact details and security.</p>

      <div className="glass-dark mt-8 flex items-center gap-5 rounded-2xl p-6">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.08] text-[1.5rem] font-semibold tracking-tight text-white">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              currentUser.username.slice(0, 1).toUpperCase()
            )}
          </div>
          <button
            type="button"
            onClick={pickAvatar}
            disabled={avatarBusy}
            aria-label="Change profile picture"
            className="press absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-mint text-brand-deep"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>
        <div>
          <p className="text-[1.05rem] font-semibold tracking-tight text-white">{currentUser.username}</p>
          <p className="mt-1 text-[0.78rem] text-white/50">
            {avatarBusy ? "Uploading…" : details?.email ?? "Tap the camera to change your photo."}
          </p>
          {avatarError && <p className="mt-1 text-[0.76rem] text-red-400">{avatarError}</p>}
        </div>
      </div>

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Personal details</p>
      <FieldGroup>
        <FieldRow label="Username">
          <FieldInput value={username} onChange={(e) => setUsername(e.target.value)} />
        </FieldRow>
        <FieldRow label="Phone number">
          <FieldInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+44 7700 900000"
          />
        </FieldRow>
        <FieldRow label="Date of birth">
          <FieldInput
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={loadingDetails}
          />
        </FieldRow>
        <FieldRow label="Address line 1">
          <FieldInput value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Flat 4, 12 Gold Street" />
        </FieldRow>
        <FieldRow label="Address line 2 · optional">
          <FieldInput value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
        </FieldRow>
        <FieldRow label="City">
          <FieldInput value={city} onChange={(e) => setCity(e.target.value)} />
        </FieldRow>
        <FieldRow label="Postcode">
          <FieldInput value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} />
        </FieldRow>
        <FieldRow label="Country">
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={`${fieldInputCls} appearance-none`}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-background text-foreground">
                {c}
              </option>
            ))}
          </select>
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={saveProfile} saving={profileSaving} saved={profileSaved} error={profileError} />

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Email address</p>
      <FieldGroup>
        <FieldRow label="Current email">
          <p className="mt-1 text-[16px] tracking-tight text-white/50">{details?.email ?? "—"}</p>
        </FieldRow>
        <FieldRow label="New email">
          <FieldInput type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="you@example.com" />
        </FieldRow>
      </FieldGroup>
      <p className="mt-2 text-[0.72rem] text-muted/70">
        We'll send a confirmation link to your new address — it only takes effect once you click it.
      </p>
      <SaveBar onSave={saveEmail} saving={emailSaving} saved={emailSaved} error={emailError} label="Send confirmation" />

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Password</p>
      <FieldGroup>
        <FieldRow label="New password">
          <PasswordFieldInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </FieldRow>
        <FieldRow label="Confirm new password">
          <PasswordFieldInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={savePassword} saving={passwordSaving} saved={passwordSaved} error={passwordError} label="Update password" />

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">More</p>
      <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06]">
        <AccountLinkRow to="/payments" icon={CreditCard} label="Payments & payouts" />
        <AccountLinkRow to="/help" icon={HelpCircle} label="Help centre" />
      </div>

      <button
        type="button"
        onClick={logOut}
        className="press mt-9 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/[0.08] py-3.5 text-[0.85rem] font-semibold tracking-tight text-red-400"
      >
        <LogOut className="h-4 w-4" strokeWidth={2.1} />
        Log out
      </button>
    </div>
  );
}
