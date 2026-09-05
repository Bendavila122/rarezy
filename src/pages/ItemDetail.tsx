import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { BadgeCheck, ShoppingBag, Ticket, X } from "lucide-react";
import { formatDate, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy } from "@/lib/store";
import { gameById } from "@/lib/games";
import { dealerById } from "@/lib/dealers";
import { authGate } from "@/lib/authGate";
import { LeaderboardView } from "@/components/LeaderboardView";
import { CountdownBar } from "@/components/Countdown";
import { FreeTrial } from "@/components/FreeTrial";
import { CertificateOfAuthenticity } from "@/components/CertificateOfAuthenticity";
import { DealerCard, HouseStockCard } from "@/components/DealerCard";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const SPEC_ROWS: { key: string; label: string }[] = [
  { key: "movement", label: "Movement" },
  { key: "caseMaterial", label: "Case material" },
  { key: "caseDiameterMm", label: "Case diameter" },
  { key: "braceletMaterial", label: "Bracelet / strap" },
  { key: "lugWidthMm", label: "Lug width" },
  { key: "dialColor", label: "Dial" },
  { key: "bezelMaterial", label: "Bezel" },
  { key: "crystal", label: "Crystal" },
  // Cars
  { key: "bodyType", label: "Body type" },
  { key: "mileage", label: "Mileage" },
  { key: "fuelType", label: "Fuel type" },
  { key: "transmission", label: "Transmission" },
  { key: "drivetrain", label: "Drivetrain" },
  { key: "enginePowerBhp", label: "Power" },
  { key: "doors", label: "Doors" },
  // Handbags / clothing
  { key: "color", label: "Colour" },
  { key: "material", label: "Material" },
  { key: "size", label: "Size" },
  { key: "hardware", label: "Hardware" },
  { key: "gemstone", label: "Gemstone" },
  // Electronics
  { key: "storageCapacity", label: "Storage" },
  { key: "screenSize", label: "Screen size" },
  { key: "connectivity", label: "Connectivity" },
  { key: "accessories", label: "Accessories" },
];

export function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const { records, currentUser } = useRarezy();
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [lightbox, setLightbox] = useState(false);

  const c = records.find((r) => r.id === itemId && r.kind === "competition");

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  if (!c || c.kind !== "competition") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
          ← Back to watches
        </button>
        <p className="mt-6 text-[0.9rem] text-muted">That listing isn't here any more.</p>
      </div>
    );
  }

  const dealer = dealerById(c.dealerId);
  const photos = c.item.photos ?? [];
  const raised = c.entriesSold * c.entryFee;
  const fundedPct = Math.max(4, Math.min(100, Math.round((raised / c.targetMax) * 100)));
  const minimumPct = Math.max(0, Math.min(100, Math.round((c.minimumPrice / c.targetMax) * 100)));

  const buyTicket = () => {
    if (!currentUser) {
      authGate.request("Create a free account to buy a ticket.");
      return;
    }
    rarezy.addToBasket(c.id, qty);
  };

  const UNIT_SUFFIX: Record<string, string> = {
    caseDiameterMm: " mm",
    lugWidthMm: " mm",
    mileage: " miles",
    enginePowerBhp: " bhp",
  };

  const specs = SPEC_ROWS.map((row) => {
    const raw = (c.item as Record<string, unknown>)[row.key];
    const suffix = UNIT_SUFFIX[row.key];
    return {
      ...row,
      value:
        raw === undefined || raw === null
          ? undefined
          : row.key === "mileage" && typeof raw === "number"
            ? `${raw.toLocaleString("en-GB")}${suffix}`
            : suffix
              ? `${raw}${suffix}`
              : raw,
    };
  }).filter((row) => row.value);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
        ← Back to watches
      </button>

      {photos.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="mt-6 block w-full cursor-zoom-in overflow-hidden rounded-none bg-white/[0.04]"
          >
            <img src={photos[activePhoto]} alt={titleOf(c.item)} className="aspect-[4/3] w-full object-cover" />
          </button>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {photos.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-none border ${
                    i === activePhoto ? "border-brand" : "border-white/10"
                  }`}
                >
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <p className={`${labelCls} mt-6`}>{c.item.brand}</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-[-0.03em]">
        {titleOf(c.item)}
      </h1>

      {c.certificateId && (
        <Link
          to={c.analysisReport ? `/certificate/${c.id}` : "/about#authenticated"}
          className="press mt-2 inline-flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-foreground"
        >
          Authenticated
          <BadgeCheck className="h-3.5 w-3.5 text-blue-400" strokeWidth={2.2} />
        </Link>
      )}

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className={labelCls}>Ticket price</p>
          <p className="tabular mt-1 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-brand">
            {money(c.entryFee)}
          </p>
        </div>
        <div className="text-right">
          {c.status === "live" && <p className="text-[0.78rem] text-muted">Ends {formatDate(c.deadlineAt)}</p>}
          <p className="mt-1 text-[0.68rem] text-muted/60">Played on {gameById(c.gameId).name}</p>
        </div>
      </div>

      {c.status === "live" && (
        <div className="mt-4 rounded-none bg-brand-deep p-4">
          <CountdownBar deadlineAt={c.deadlineAt} />
          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-1.5 flex-1 bg-white/10">
              <div className="h-full overflow-hidden rounded-none">
                <div
                  className="h-full rounded-none bg-mint transition-all duration-500"
                  style={{ width: `${fundedPct}%` }}
                />
              </div>
              {/* The seller's committed minimum — always set below their ticket price, so a real cash offer or the raised amount can still clear it even if the listing doesn't sell out. */}
              <div
                className="absolute -top-1 -bottom-1 w-[2px] bg-red-500"
                style={{ left: `${minimumPct}%` }}
                title={`Seller's minimum: ${money(c.minimumPrice)}`}
              />
            </div>
            <span className="tabular shrink-0 text-[0.72rem] text-white/70">
              {c.entriesSold}/{c.entriesTotal} entries
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-white/45">
            <span className="inline-block h-2 w-[2px] bg-red-500" />
            Seller's minimum — {money(c.minimumPrice)}
          </p>
        </div>
      )}

      {c.status === "live" ? (
        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            {[1, 5, 10, 20].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setQty(v)}
                className={`flex-1 rounded-none border py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
                  qty === v ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={buyTicket}
            className="flex w-full items-center justify-center gap-2 rounded-none bg-brand py-3.5 text-[0.88rem] font-medium tracking-tight text-background"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            Add {qty > 1 ? `${qty} ` : ""}to basket — {money(c.entryFee * qty)}
          </button>
        </div>
      ) : null}

      {c.status === "live" && (
        <div className="mt-4">
          <FreeTrial onClick={buyTicket} ticketCta="Add a real ticket" />
        </div>
      )}

      {c.status !== "live" && (
        <p className="mt-5 text-[0.85rem] leading-relaxed text-muted">
          {c.status === "closed"
            ? `This listing has closed. Won by ${c.winnerName}.`
            : "Entries aren't open on this one right now."}
        </p>
      )}

      {c.attemptsRemaining > 0 && (
        <Link
          to="/entries"
          className="mt-3 flex items-center gap-2 rounded-none border border-brand/30 bg-brand/10 px-4 py-3 text-[0.8rem] text-brand"
        >
          <Ticket className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          You have {c.attemptsRemaining} attempt{c.attemptsRemaining > 1 ? "s" : ""} to play — go to your entries
        </Link>
      )}

      <div className="mt-9">
        <p className={labelCls}>Sold by</p>
        <div className="mt-3">{dealer ? <DealerCard dealer={dealer} /> : <HouseStockCard />}</div>
      </div>

      {c.item.description && (
        <>
          <p className={`${labelCls} mt-9`}>Description</p>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">{c.item.description}</p>
        </>
      )}

      {specs.length > 0 && (
        <>
          <p className={`${labelCls} mt-9`}>Details</p>
          <div className="mt-3 overflow-hidden rounded-none border border-white/10">
            {specs.map((row, i) => (
              <div
                key={row.key}
                className={`flex items-center justify-between px-4 py-2.5 text-[0.8rem] ${
                  i % 2 === 1 ? "bg-white/[0.02]" : ""
                }`}
              >
                <span className="text-muted">{row.label}</span>
                <span className="text-right">{String(row.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {c.analysisReport && (
        <div className="mt-9">
          <p className={labelCls}>Certificate of authenticity</p>
          <div className="mt-3">
            <CertificateOfAuthenticity item={c.item} report={c.analysisReport} compact />
          </div>
          <Link
            to={`/certificate/${c.id}`}
            className="mt-3 inline-block text-[0.78rem] text-brand underline underline-offset-4"
          >
            View full certificate
          </Link>
        </div>
      )}

      {c.leaderboard.length > 0 && (
        <div className="mt-9">
          <p className={labelCls}>Leaderboard</p>
          <div className="mt-3">
            <LeaderboardView leaderboard={c.leaderboard} />
          </div>
        </div>
      )}

      {lightbox && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-none bg-white/10 text-white"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <img src={photos[activePhoto]} alt={titleOf(c.item)} className="max-h-full max-w-full rounded-none object-contain" />
        </div>
      )}
    </div>
  );
}
