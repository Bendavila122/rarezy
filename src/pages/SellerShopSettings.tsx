import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Check, Image as ImageIcon, MapPin } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { marketDb, type Seller } from "@/lib/db";
import { geocodeLocation, osmEmbedUrl } from "@/lib/geocode";
import { AccountRequired } from "@/components/AccountRequired";
import { FieldGroup, FieldInput, FieldRow, fieldInputCls } from "@/components/AuthField";

/** Same shape as `SaveBar` in Settings.tsx — every section here saves independently. */
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

export function SellerShopSettings() {
  const { currentUser } = useRarezy();
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);
  const [imageBusy, setImageBusy] = useState<"logo" | "cover" | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [about, setAbout] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);

  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);

  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [socialSaving, setSocialSaving] = useState(false);
  const [socialSaved, setSocialSaved] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  const [locationSaving, setLocationSaving] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    marketDb.fetchMySeller(currentUser.id).then((s) => {
      setSeller(s);
      if (!s) return;
      setAbout(s.about ?? "");
      setContactPhone(s.contactPhone ?? "");
      setWebsite(s.website ?? "");
      setInstagramUrl(s.instagramUrl ?? "");
      setFacebookUrl(s.facebookUrl ?? "");
      setTwitterUrl(s.twitterUrl ?? "");
      setTiktokUrl(s.tiktokUrl ?? "");
      setLocationInput(s.locationLabel ?? "");
      setLocationLat(s.locationLat);
      setLocationLng(s.locationLng);
    });
  }, [currentUser?.id]);

  if (!currentUser) {
    return <AccountRequired title="Create an account to sell with us" body="Sign in to manage your shop." />;
  }
  if (seller === undefined) return null;
  if (!seller || seller.status !== "approved") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-[1.4rem] font-semibold tracking-[-0.02em]">Approved sellers only</h1>
        <p className="mt-3 text-[0.85rem] text-muted">You need an approved seller account to customise your shop.</p>
      </div>
    );
  }

  const pickImage = (kind: "logo" | "cover") => (kind === "logo" ? logoRef : coverRef).current?.click();

  const onImageChange = (kind: "logo" | "cover") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageBusy(kind);
    setImageError(null);
    try {
      const url = await marketDb.uploadSellerImage(seller.id, kind, file);
      setSeller((s) => (s ? { ...s, [kind === "logo" ? "logoUrl" : "coverPhotoUrl"]: url } : s));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Couldn't upload that image.");
    } finally {
      setImageBusy(null);
    }
  };

  const saveAbout = async () => {
    setAboutSaving(true);
    setAboutError(null);
    setAboutSaved(false);
    try {
      await marketDb.updateSellerProfile(seller.id, { about: about.trim() || null });
      setAboutSaved(true);
    } catch (err) {
      setAboutError(err instanceof Error ? err.message : "Couldn't save that.");
    } finally {
      setAboutSaving(false);
    }
  };

  const saveContact = async () => {
    setContactSaving(true);
    setContactError(null);
    setContactSaved(false);
    try {
      await marketDb.updateSellerProfile(seller.id, {
        contactPhone: contactPhone.trim() || null,
        website: website.trim() || null,
      });
      setContactSaved(true);
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Couldn't save those details.");
    } finally {
      setContactSaving(false);
    }
  };

  const saveSocials = async () => {
    setSocialSaving(true);
    setSocialError(null);
    setSocialSaved(false);
    try {
      await marketDb.updateSellerProfile(seller.id, {
        instagramUrl: instagramUrl.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        tiktokUrl: tiktokUrl.trim() || null,
      });
      setSocialSaved(true);
    } catch (err) {
      setSocialError(err instanceof Error ? err.message : "Couldn't save those links.");
    } finally {
      setSocialSaving(false);
    }
  };

  const saveLocation = async () => {
    if (!locationInput.trim()) {
      setLocationError("Enter a location first.");
      return;
    }
    setLocationSaving(true);
    setLocationError(null);
    setLocationSaved(false);
    try {
      const point = await geocodeLocation(locationInput.trim());
      if (!point) throw new Error("Couldn't find that location — try being more specific.");
      await marketDb.updateSellerProfile(seller.id, {
        locationLabel: locationInput.trim(),
        locationLat: point.lat,
        locationLng: point.lng,
      });
      setLocationLat(point.lat);
      setLocationLng(point.lng);
      setLocationSaved(true);
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : "Couldn't save that location.");
    } finally {
      setLocationSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link to="/seller" className="text-[0.72rem] text-muted underline underline-offset-4">
        ← Dashboard
      </Link>
      <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Shop settings</h1>
      <p className="mt-2 text-[0.85rem] text-muted">
        Customise how {seller.businessName}'s public shop looks to buyers.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative h-36 w-full bg-white/[0.06]">
          {seller.coverPhotoUrl && <img src={seller.coverPhotoUrl} alt="" className="h-full w-full object-cover" />}
          <button
            type="button"
            onClick={() => pickImage("cover")}
            disabled={imageBusy === "cover"}
            className="press absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-[0.72rem] font-medium text-white backdrop-blur"
          >
            <ImageIcon className="h-3.5 w-3.5" strokeWidth={2} />
            {imageBusy === "cover" ? "Uploading…" : "Cover photo"}
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onImageChange("cover")} />

          <div className="absolute -bottom-8 left-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-white/10 text-[1.1rem] font-semibold text-foreground">
                {seller.logoUrl ? (
                  <img src={seller.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  seller.businessName.slice(0, 1).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => pickImage("logo")}
                disabled={imageBusy === "logo"}
                aria-label="Change logo"
                className="press absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-brand text-background"
              >
                <Camera className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onImageChange("logo")} />
            </div>
          </div>
        </div>
        <div className="h-9 bg-background" />
      </div>
      {imageError && <p className="mt-2 text-[0.78rem] text-red-400">{imageError}</p>}

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">About your store</p>
      <FieldGroup>
        <FieldRow label="Description">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder="Tell buyers what makes your shop worth watching — your specialism, history, what you stand for."
            className={`${fieldInputCls} resize-none`}
          />
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={saveAbout} saving={aboutSaving} saved={aboutSaved} error={aboutError} />

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Contact</p>
      <FieldGroup>
        <FieldRow label="Phone number">
          <FieldInput value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+44 20 7946 0958" />
        </FieldRow>
        <FieldRow label="Website">
          <FieldInput value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={saveContact} saving={contactSaving} saved={contactSaved} error={contactError} />

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Location</p>
      <FieldGroup>
        <FieldRow label="City or address">
          <FieldInput value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="Mayfair, London" />
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={saveLocation} saving={locationSaving} saved={locationSaved} error={locationError} label="Update location" />
      {locationLat !== null && locationLng !== null && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="Shop location"
            src={osmEmbedUrl(locationLat, locationLng)}
            className="h-48 w-full"
            style={{ border: 0 }}
          />
          <p className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-2 text-[0.72rem] text-muted">
            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
            {locationInput}
          </p>
        </div>
      )}

      <p className="mb-2 mt-9 text-[0.72rem] uppercase tracking-[0.2em] text-muted">Socials</p>
      <FieldGroup>
        <FieldRow label="Instagram">
          <FieldInput value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/…" />
        </FieldRow>
        <FieldRow label="Facebook">
          <FieldInput value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/…" />
        </FieldRow>
        <FieldRow label="X / Twitter">
          <FieldInput value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/…" />
        </FieldRow>
        <FieldRow label="TikTok">
          <FieldInput value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@…" />
        </FieldRow>
      </FieldGroup>
      <SaveBar onSave={saveSocials} saving={socialSaving} saved={socialSaved} error={socialError} />

      <Link
        to={`/seller/${seller.id}`}
        className="mt-9 inline-block text-[0.78rem] text-brand underline underline-offset-4"
      >
        View your public shop →
      </Link>
    </div>
  );
}
