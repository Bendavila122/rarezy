import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Download, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import {
  marketingCentre,
  type EmailContent,
  type InstagramFeedContent,
  type InstagramStoryContent,
  type MarketingAsset,
  type MarketingChannel,
  type MetaAdContent,
  type TikTokContent,
  type WhatsAppContent,
} from "@/lib/marketing";
import { marketDb, type MarketCompetition } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const CHANNELS: { id: MarketingChannel; label: string }[] = [
  { id: "instagram_feed", label: "Instagram Feed" },
  { id: "instagram_story", label: "Instagram Story" },
  { id: "tiktok", label: "TikTok" },
  { id: "meta_ad", label: "Meta Ad" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
];

const META_ANGLES = ["luxury", "opportunity", "scarcity", "urgency", "game", "dealer_credibility"];
const EMAIL_VARIANTS = ["launch", "reminder", "last_chance", "final_hours"];

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function ActionBar({ onCopy, onRegenerate, onDelete }: { onCopy?: () => void; onRegenerate: () => void; onDelete: () => void }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      {onCopy && (
        <button type="button" onClick={onCopy} className="flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-foreground">
          <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
          Copy text
        </button>
      )}
      <button type="button" onClick={onRegenerate} className="flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-foreground">
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />
        Regenerate
      </button>
      <button type="button" onClick={onDelete} className="flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-red-400">
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
        Delete
      </button>
    </div>
  );
}

function AssetCard({ asset, onRegenerate, onDelete }: { asset: MarketingAsset; onRegenerate: () => void; onDelete: () => void }) {
  if (asset.status === "generating") {
    return (
      <div className="card flex items-center gap-3 p-5">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="text-[0.8rem] text-muted">Generating image — usually about a minute…</p>
      </div>
    );
  }
  if (asset.status === "failed") {
    return (
      <div className="card p-5">
        <p className="text-[0.8rem] text-red-400">Generation failed.</p>
        <ActionBar onRegenerate={onRegenerate} onDelete={onDelete} />
      </div>
    );
  }

  if (asset.channel === "instagram_feed") {
    // Image and caption are two independent generations against this same
    // row — one can be ready before, or without, the other.
    if (!asset.content) {
      return (
        <div className="card overflow-hidden">
          {asset.imageUrl && <img src={asset.imageUrl} alt="" className="aspect-square w-full object-cover" />}
          <div className="p-5">
            <p className="text-[0.8rem] text-muted">Image ready — no caption yet.</p>
            <ActionBar onRegenerate={onRegenerate} onDelete={onDelete} />
          </div>
        </div>
      );
    }
    const c = asset.content as InstagramFeedContent;
    return (
      <div className="card overflow-hidden">
        {asset.imageUrl && <img src={asset.imageUrl} alt="" className="aspect-square w-full object-cover" />}
        <div className="p-5">
          <p className="text-[1rem] font-medium tracking-tight">{c.headline}</p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{c.caption}</p>
          <p className="mt-2 text-[0.8rem] text-brand">{c.cta}</p>
          <p className="mt-2 text-[0.74rem] text-muted/70">{c.hashtags?.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>
          <div className="flex items-center gap-3">
            {asset.imageUrl && (
              <a
                href={asset.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
                Open image
              </a>
            )}
          </div>
          <ActionBar
            onCopy={() => copyText(`${c.headline}\n\n${c.caption}\n\n${c.cta}\n\n${c.hashtags?.map((h) => `#${h}`).join(" ")}`)}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  if (asset.channel === "instagram_story") {
    const c = asset.content as InstagramStoryContent;
    return (
      <div className="card p-5">
        <p className={labelCls}>5-frame story</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {c.frames?.map((f, i) => (
            <div key={i} className="flex aspect-[9/16] items-center justify-center bg-white/[0.06] p-1.5 text-center text-[0.6rem] leading-tight text-foreground">
              {f.text}
            </div>
          ))}
        </div>
        <ActionBar
          onCopy={() => copyText(c.frames?.map((f) => f.text).join("\n\n"))}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      </div>
    );
  }

  if (asset.channel === "tiktok") {
    const c = asset.content as TikTokContent;
    return (
      <div className="card p-5">
        <p className={labelCls}>Hook</p>
        <p className="mt-1 text-[0.9rem] font-medium">{c.hook}</p>
        <p className={`${labelCls} mt-4`}>Script</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">{c.script}</p>
        <p className={`${labelCls} mt-4`}>On-screen text</p>
        <ul className="mt-1 list-disc pl-4 text-[0.8rem] text-muted">
          {c.onScreenText?.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <p className="mt-3 text-[0.8rem] text-brand">{c.cta}</p>
        <p className="mt-2 text-[0.74rem] text-muted/70">{c.hashtags?.map((h) => `#${h}`).join(" ")} · ~{c.suggestedDurationSec}s</p>
        <ActionBar
          onCopy={() => copyText(`${c.hook}\n\n${c.script}\n\n${c.onScreenText?.join("\n")}\n\n${c.caption}`)}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      </div>
    );
  }

  if (asset.channel === "meta_ad") {
    const c = asset.content as MetaAdContent;
    return (
      <div className="card p-5">
        <p className={labelCls}>{c.angle} angle</p>
        <p className="mt-2 text-[1rem] font-medium">{c.headline}</p>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{c.primaryText}</p>
        <p className="mt-2 text-[0.78rem] text-muted/80">{c.description}</p>
        <p className="mt-2 text-[0.8rem] text-brand">{c.cta}</p>
        <ActionBar
          onCopy={() => copyText(`${c.headline}\n\n${c.primaryText}\n\n${c.description}\n\n${c.cta}`)}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      </div>
    );
  }

  if (asset.channel === "email") {
    const c = asset.content as EmailContent;
    return (
      <div className="card p-5">
        <p className={labelCls}>{c.variant}</p>
        <p className="mt-2 text-[1rem] font-medium">{c.subject}</p>
        <p className="mt-1 text-[0.76rem] text-muted/70">{c.preview}</p>
        <p className="mt-3 text-[0.9rem] font-medium">{c.header}</p>
        <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-relaxed text-muted">{c.body}</p>
        <p className="mt-2 text-[0.8rem] text-brand">{c.cta}</p>
        <ActionBar
          onCopy={() => copyText(`Subject: ${c.subject}\n\n${c.header}\n\n${c.body}\n\n${c.cta}`)}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      </div>
    );
  }

  const c = asset.content as WhatsAppContent;
  return (
    <div className="card p-5">
      <p className="text-[0.85rem] leading-relaxed text-foreground">{c.message}</p>
      <ActionBar onCopy={() => copyText(c.message)} onRegenerate={onRegenerate} onDelete={onDelete} />
    </div>
  );
}

export function MarketingCentre() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { currentUser } = useRarezy();
  const [competition, setCompetition] = useState<MarketCompetition | null | undefined>(undefined);
  const [assets, setAssets] = useState<MarketingAsset[]>([]);
  const [activeChannel, setActiveChannel] = useState<MarketingChannel>("instagram_feed");
  const [metaAngle, setMetaAngle] = useState(META_ANGLES[0]!);
  const [emailVariant, setEmailVariant] = useState(EMAIL_VARIANTS[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    if (!competitionId) return;
    marketDb.fetchCompetition(competitionId).then(setCompetition);
    marketingCentre.fetchCampaignAssets(competitionId).then(setAssets);
  };
  useEffect(reload, [competitionId]);

  // Poll any still-generating image assets.
  useEffect(() => {
    const pending = assets.filter((a) => a.status === "generating");
    if (pending.length === 0) return;
    const t = setTimeout(() => {
      Promise.all(pending.map((a) => marketingCentre.checkImage(a.id))).then(reload);
    }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);

  if (!currentUser) {
    return <AccountRequired title="Create an account to sell with us" body="Sign in to use the Marketing Centre." />;
  }
  if (competition === undefined) return null;
  if (!competition) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-[0.9rem] text-muted">That competition isn't here any more.</p>
      </div>
    );
  }

  const generate = async () => {
    if (!competitionId) return;
    setBusy(true);
    setError(null);
    // Image and text are two independent generations (one async/AtlasCloud,
    // one synchronous/Anthropic) — reload after each so a failure in one
    // doesn't hide a success in the other, and surface both errors if both
    // fail rather than only ever reporting the first.
    const errors: string[] = [];
    // For image channels, the copy attaches to the SAME asset row the image
    // job created (one Instagram post = one row with both an image and a
    // caption), rather than each generation creating its own row.
    let imageAssetId: string | undefined;
    if (marketingCentre.channelNeedsImage(activeChannel)) {
      try {
        const asset = await marketingCentre.generateImage(competitionId, activeChannel);
        imageAssetId = asset.id;
        reload();
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Couldn't generate the image.");
      }
    }
    try {
      await marketingCentre.generateText(competitionId, activeChannel, {
        angle: activeChannel === "meta_ad" ? metaAngle : undefined,
        variant: activeChannel === "email" ? emailVariant : undefined,
        assetId: imageAssetId,
      });
      reload();
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Couldn't generate the copy.");
    }
    if (errors.length > 0) setError(errors.join(" "));
    setBusy(false);
  };

  const remove = async (id: string) => {
    await marketingCentre.deleteAsset(id);
    reload();
  };

  const channelAssets = assets.filter((a) => a.channel === activeChannel);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className={labelCls}>AI Marketing Centre</p>
      <h1 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.03em]">
        {competition.product.brand} {competition.product.model}
      </h1>
      <p className="mt-2 text-[0.85rem] text-muted">
        Free, generated specifically for this competition — download or copy anything below and post it wherever your
        customers already are.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveChannel(c.id)}
            className={`rounded-none border px-4 py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
              activeChannel === c.id ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {activeChannel === "meta_ad" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {META_ANGLES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setMetaAngle(a)}
              className={`rounded-none border px-3 py-1.5 text-[0.72rem] capitalize tracking-tight transition-all active:scale-[0.97] ${
                metaAngle === a ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
              }`}
            >
              {a.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      {activeChannel === "email" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EMAIL_VARIANTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setEmailVariant(v)}
              className={`rounded-none border px-3 py-1.5 text-[0.72rem] capitalize tracking-tight transition-all active:scale-[0.97] ${
                emailVariant === v ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
              }`}
            >
              {v.replace("_", " ")}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {busy ? "Generating…" : `Generate ${CHANNELS.find((c) => c.id === activeChannel)?.label}`}
      </button>
      {error && <p className="mt-3 text-[0.78rem] text-red-400">{error}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {channelAssets.length === 0 ? (
          <p className="text-center text-[0.85rem] text-muted">Nothing generated for this channel yet.</p>
        ) : (
          channelAssets.map((a) => <AssetCard key={a.id} asset={a} onRegenerate={generate} onDelete={() => remove(a.id)} />)
        )}
      </div>
    </div>
  );
}
