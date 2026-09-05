import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Facebook, Globe, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { marketDb, moneyFromPence, type MarketCompetition, type Seller } from "@/lib/db";
import { osmEmbedUrl } from "@/lib/geocode";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

/** X/Twitter's own mark isn't in lucide — a small inline glyph keeps the socials row visually consistent with the other icon buttons instead of falling back to a generic link icon. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
    </svg>
  );
}

/** TikTok's own mark isn't in lucide either. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M16.6 5.8a4.3 4.3 0 0 1-3.1-3.5h-3.2v13.7a2.6 2.6 0 1 1-1.9-2.5V10.2a5.9 5.9 0 1 0 5.1 5.9V9.3a7.5 7.5 0 0 0 4.4 1.4V7.5a4.3 4.3 0 0 1-1.3-1.7Z" />
    </svg>
  );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="press flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground hover:border-brand/40 hover:text-brand"
    >
      {children}
    </a>
  );
}

export function SellerStorefront() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);
  const [competitions, setCompetitions] = useState<MarketCompetition[]>([]);

  useEffect(() => {
    if (!sellerId) return;
    marketDb.fetchPublicSeller(sellerId).then(setSeller);
    marketDb.fetchSellerLiveCompetitions(sellerId).then(setCompetitions);
  }, [sellerId]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  if (seller === undefined) return null;
  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
          ← Back
        </button>
        <p className="mt-6 text-[0.9rem] text-muted">That seller isn't here any more.</p>
      </div>
    );
  }

  const live = competitions.filter((c) => c.status === "live");
  const hasSocials = seller.instagramUrl || seller.facebookUrl || seller.twitterUrl || seller.tiktokUrl || seller.website;
  const hasLocation = seller.locationLat !== null && seller.locationLng !== null;

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <div className="px-6 pt-6">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted hover:text-foreground">
          ← Back
        </button>
      </div>

      <div className="relative mt-4 h-48 w-full overflow-hidden bg-white/[0.06] sm:h-64">
        {seller.coverPhotoUrl && <img src={seller.coverPhotoUrl} alt="" className="h-full w-full object-cover" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="px-6">
        <div className="relative -mt-10 flex items-end gap-4 sm:-mt-12">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-white/10 text-[1.3rem] font-semibold sm:h-24 sm:w-24">
            {seller.logoUrl ? (
              <img src={seller.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              seller.businessName.slice(0, 1).toUpperCase()
            )}
          </div>
        </div>

        <p className={`${labelCls} mt-4`}>Verified Rarezy seller</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 text-[1.7rem] font-semibold tracking-[-0.03em]">
          {seller.businessName}
          <BadgeCheck className="h-5 w-5 shrink-0 text-blue-400" strokeWidth={2.2} />
        </h1>

        {seller.about && <p className="mt-3 max-w-2xl text-[0.88rem] leading-relaxed text-muted">{seller.about}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-muted">
          {seller.contactEmail && (
            <a href={`mailto:${seller.contactEmail}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Mail className="h-3.5 w-3.5" strokeWidth={2} />
              {seller.contactEmail}
            </a>
          )}
          {seller.contactPhone && (
            <a href={`tel:${seller.contactPhone}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
              {seller.contactPhone}
            </a>
          )}
          {seller.locationLabel && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              {seller.locationLabel}
            </span>
          )}
        </div>

        {hasSocials && (
          <div className="mt-4 flex items-center gap-2">
            {seller.website && (
              <SocialLink href={seller.website}>
                <Globe className="h-4 w-4" strokeWidth={2} />
              </SocialLink>
            )}
            {seller.instagramUrl && (
              <SocialLink href={seller.instagramUrl}>
                <Instagram className="h-4 w-4" strokeWidth={2} />
              </SocialLink>
            )}
            {seller.facebookUrl && (
              <SocialLink href={seller.facebookUrl}>
                <Facebook className="h-4 w-4" strokeWidth={2} />
              </SocialLink>
            )}
            {seller.twitterUrl && (
              <SocialLink href={seller.twitterUrl}>
                <XIcon className="h-3.5 w-3.5" />
              </SocialLink>
            )}
            {seller.tiktokUrl && (
              <SocialLink href={seller.tiktokUrl}>
                <TikTokIcon className="h-4 w-4" />
              </SocialLink>
            )}
          </div>
        )}

        {hasLocation && (
          <div className="mt-6 max-w-md overflow-hidden rounded-none border border-white/10">
            <iframe
              title={`${seller.businessName} location`}
              src={osmEmbedUrl(seller.locationLat!, seller.locationLng!)}
              className="h-40 w-full"
              style={{ border: 0 }}
            />
          </div>
        )}

        <h2 className="mt-12 text-[1.2rem] font-semibold tracking-[-0.02em]">
          {live.length} live competition{live.length === 1 ? "" : "s"}
        </h2>
        {live.length === 0 ? (
          <p className="mt-6 text-[0.85rem] text-muted">Nothing live from this seller right now.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {live.map((c) => (
              <Link key={c.id} to={`/c/${c.id}`} className="press card overflow-hidden">
                {c.product.images[0] && (
                  <img src={c.product.images[0].url} alt="" className="aspect-square w-full object-cover" />
                )}
                <div className="p-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">{c.product.brand}</p>
                  <p className="mt-1 text-[0.85rem] tracking-tight">{c.product.model}</p>
                  <p className="tabular mt-2 text-[0.9rem] font-semibold text-brand">{moneyFromPence(c.ticketPricePence)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
