import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Check } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { auth, type ProfileDetails } from "@/lib/auth";
import { AccountRequired } from "@/components/AccountRequired";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const inputCls =
  "mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40 disabled:opacity-50";

const COUNTRIES = ["United Kingdom", "Ireland", "United States", "France", "Germany", "Spain", "Italy", "Other"];

/** A card with its own save button and status — every section here saves independently, so changing your address never risks also (mis)submitting a password change. */
function SettingsSection({
  title,
  children,
  onSave,
  saving,
  saved,
  error,
  saveLabel = "Save",
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
  saveLabel?: string;
}) {
  return (
    <div className="card mt-6 p-6">
      <h2 className="text-[1rem] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
      {error && <p className="mt-4 text-[0.78rem] text-red-400">{error}</p>}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="press rounded-none bg-brand px-6 py-3 text-[0.82rem] font-medium tracking-tight text-background disabled:opacity-50"
        >
          {saving ? "Saving…" : saveLabel}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-[0.78rem] text-brand">
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

export function Settings() {
  const { currentUser } = useRarezy();
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/account" className="text-[0.72rem] text-muted underline underline-offset-4">
        ← Account
      </Link>
      <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Settings</h1>
      <p className="mt-2 text-[0.85rem] text-muted">Manage your profile, contact details and security.</p>

      <div className="card mt-8 flex items-center gap-5 p-6">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.06] text-[1.5rem] font-semibold tracking-tight text-foreground">
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
            className="press absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-background text-foreground"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>
        <div>
          <p className="text-[0.95rem] font-medium tracking-tight">{currentUser.username}</p>
          <p className="mt-1 text-[0.78rem] text-muted">{avatarBusy ? "Uploading…" : "Tap the camera to change your photo."}</p>
          {avatarError && <p className="mt-1 text-[0.76rem] text-red-400">{avatarError}</p>}
        </div>
      </div>

      <SettingsSection
        title="Personal details"
        onSave={saveProfile}
        saving={profileSaving}
        saved={profileSaved}
        error={profileError}
      >
        <div>
          <p className={labelCls}>Username</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
        </div>
        <div>
          <p className={labelCls}>Phone number</p>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+44 7700 900000"
            className={inputCls}
          />
        </div>
        <div>
          <p className={labelCls}>Date of birth</p>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={loadingDetails}
            className={inputCls}
          />
        </div>
        <div>
          <p className={labelCls}>Address line 1</p>
          <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Flat 4, 12 Gold Street" className={inputCls} />
        </div>
        <div>
          <p className={labelCls}>Address line 2 · optional</p>
          <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={labelCls}>City</p>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <div>
            <p className={labelCls}>Postcode</p>
            <input value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} className={inputCls} />
          </div>
        </div>
        <div>
          <p className={labelCls}>Country</p>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] tracking-tight text-foreground outline-none focus:border-brand/40"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Email address"
        onSave={saveEmail}
        saving={emailSaving}
        saved={emailSaved}
        error={emailError}
        saveLabel="Send confirmation"
      >
        <div>
          <p className={labelCls}>Current email</p>
          <p className="mt-3 text-[0.9rem] tracking-tight text-muted">{details?.email ?? "—"}</p>
        </div>
        <div>
          <p className={labelCls}>New email</p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
          <p className="mt-2 text-[0.72rem] text-muted/70">
            We'll send a confirmation link to your new address — it only takes effect once you click it.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Password"
        onSave={savePassword}
        saving={passwordSaving}
        saved={passwordSaved}
        error={passwordError}
        saveLabel="Update password"
      >
        <div>
          <p className={labelCls}>New password</p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <p className={labelCls}>Confirm new password</p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
        </div>
      </SettingsSection>
    </div>
  );
}
