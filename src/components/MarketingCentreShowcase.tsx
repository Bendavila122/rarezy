import { ArrowRight, Bookmark, Heart, ImagePlus, Link2, MessageCircle, MoreHorizontal, Send, Sparkles, Upload } from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  { Icon: Upload, title: "Upload your photo", body: "The real photo of the exact item you're listing — nothing else." },
  { Icon: Sparkles, title: "We edit it in place", body: "AI restyles the shot into on-brand ad creative — the product itself never changes." },
  { Icon: ImagePlus, title: "Post it anywhere", body: "Ready-sized creative and copy for Instagram, TikTok, email and more." },
];

// A spread of channels and categories — not the same watch shown three
// times — so it reads as "this works for whatever you sell", not a single
// cherry-picked example. Each one wears the real chrome of its own
// platform (feed post header + like bar, story progress + link sticker,
// an email client's from/subject line + a real CTA button) rather than a
// single generic "photo with text on it" template stretched across three
// aspect ratios — that's what makes each read as an ad actually built for
// where it runs, not a placeholder.
const FEED_EXAMPLE = {
  handle: "windsorwatchco",
  photo: "/jewellery/cartier-love-bracelet.jpg",
  sticker: "Yours for £3.",
  likes: "1,204",
  caption: "Cartier Love Bracelet · Enter now, link in bio",
  tags: "#cartier #loveyou #rarezy",
};

const STORY_EXAMPLE = {
  handle: "windsorwatchco",
  photo: "/handbags/hermes-birkin.jpg",
  headline: "Closing tonight.",
  caption: "Hermès Birkin 30",
};

const EMAIL_EXAMPLE = {
  from: "Windsor Watch Co",
  subject: "Last 40 tickets — Rolex Datejust 126234",
  photo: "/watches/rolex-datejust-126234-sunburst.jpg",
  headline: "Last 40 tickets.",
  caption: "Rolex Datejust · Enter from £5",
};

/** A concrete before/after of what the AI Marketing Centre actually does — edits a seller's real product photo into ad creative, rather than generating a product from scratch — since that distinction is the whole point of the feature and is easy to misread as "AI generates your ad" without seeing it. */
export function MarketingCentreShowcase() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="flex items-center justify-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
          AI Marketing Centre
        </p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          Your photos become the ad. Not a stock image standing in for them.
        </p>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/60">
          Free, in every seller dashboard. Upload what you're actually listing — the AI edits that exact photo into
          on-brand creative, it never invents a product that isn't the one a winner will receive.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid grid-cols-1 items-start gap-8 sm:grid-cols-[1fr_auto_1fr]">
        <div className="mx-auto w-full max-w-[15rem] overflow-hidden border border-white/10 sm:mx-0">
          <img src="/watches/rolex-datejust-126234-sunburst.jpg" alt="" className="aspect-square w-full object-cover" />
          <div className="bg-white/[0.04] p-4">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Your photo</p>
            <p className="mt-1 text-[0.8rem] text-white/70">Uploaded as-is when you list</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-2 sm:h-full sm:py-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/12 text-amber-300">
            <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" strokeWidth={2.2} />
          </span>
        </div>

        <div className="mx-auto flex flex-col items-center sm:mx-0">
          {/* A real Instagram Story template, not just a styled photo — the
              progress bar, header row, and a genuine tappable link sticker
              (Instagram's actual mechanism for putting a link in a story)
              are what make this read as an ad someone would really run,
              rather than a nicer product shot. */}
          <div className="relative w-full max-w-[15rem] overflow-hidden rounded-[1.8rem] border-[6px] border-black bg-black shadow-2xl shadow-amber-500/10">
            <div className="relative aspect-[9/17.5] w-full overflow-hidden rounded-[1.3rem] bg-[#0a0a0a]">
              <img
                src="/watches/rolex-datejust-126234-sunburst.jpg"
                alt=""
                className="h-full w-full object-cover opacity-90 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />
              <div className="absolute inset-0 bg-amber-500/10" />

              <div className="absolute inset-x-3 top-3 flex gap-1">
                <div className="h-[3px] flex-1 rounded-full bg-white" />
                <div className="h-[3px] flex-1 rounded-full bg-white/30" />
                <div className="h-[3px] flex-1 rounded-full bg-white/30" />
              </div>
              <div className="absolute inset-x-3 top-6 flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[0.5rem] font-black text-[#241a0c]">
                  R
                </span>
                <p className="text-[0.6rem] font-semibold text-white">windsorwatchco</p>
                <p className="text-[0.56rem] text-white/55">2h</p>
                <MoreHorizontal className="ml-auto h-3.5 w-3.5 text-white/70" strokeWidth={2} />
              </div>

              <div className="absolute inset-x-4 top-[38%]">
                <p className="text-[1.3rem] font-black leading-tight text-white drop-shadow">Own it for £5.</p>
                <p className="mt-1 text-[0.66rem] text-white/80">Rolex Datejust 126234</p>
              </div>

              <div className="absolute inset-x-0 bottom-12 flex justify-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-lg"
                >
                  <Link2 className="h-3 w-3 text-black" strokeWidth={2.6} />
                  <span className="text-[0.62rem] font-semibold text-black">rarezy.co.uk</span>
                </motion.div>
              </div>

              <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
                <div className="flex-1 rounded-full border border-white/40 px-3 py-1.5 text-[0.58rem] text-white/50">
                  Send message
                </div>
                <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
                <Send className="h-4 w-4 text-white" strokeWidth={1.8} />
              </div>
            </div>
            <div className="absolute left-1/2 top-2 h-[0.7rem] w-14 -translate-x-1/2 rounded-full bg-black" />
          </div>

          <div className="mt-3 text-center">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-amber-300">Generated creative</p>
            <p className="mt-1 text-[0.8rem] text-white/70">Same item, tappable link, ready to post</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-14">
        <p className="text-center text-[0.68rem] uppercase tracking-[0.24em] text-white/45">
          One upload, every channel
        </p>
        <div className="mt-5 grid grid-cols-1 items-start gap-5 sm:grid-cols-3">
          {/* Instagram Feed — real feed-post chrome: avatar header, a small
              price sticker sitting on the photo (not a full-frame overlay,
              since feed ads keep the product shot clean), then the actual
              like/comment/share row and a caption below the image. */}
          <Reveal delay={0.2} y={16}>
            <div className="overflow-hidden border border-white/10">
              <div className="flex items-center gap-2 bg-[#0d0d0d] px-3 py-2.5">
                <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-500 p-[1.5px]">
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0d0d0d] text-[0.5rem] font-black text-amber-300">
                    W
                  </span>
                </span>
                <div className="leading-tight">
                  <p className="text-[0.66rem] font-semibold text-white">{FEED_EXAMPLE.handle}</p>
                  <p className="text-[0.54rem] text-white/40">Sponsored</p>
                </div>
                <MoreHorizontal className="ml-auto h-3.5 w-3.5 text-white/40" strokeWidth={2} />
              </div>
              <div className="relative aspect-square w-full bg-[#0a0a0a]">
                <img src={FEED_EXAMPLE.photo} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-3 bottom-3">
                  <span className="inline-block rounded-md bg-white px-2 py-1 text-[0.7rem] font-bold text-black shadow-lg">
                    {FEED_EXAMPLE.sticker}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 pt-2.5">
                <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
                <MessageCircle className="h-4 w-4 text-white" strokeWidth={1.8} />
                <Send className="h-4 w-4 text-white" strokeWidth={1.8} />
                <Bookmark className="ml-auto h-4 w-4 text-white" strokeWidth={1.8} />
              </div>
              <div className="px-3 pb-3 pt-1.5">
                <p className="text-[0.6rem] font-semibold text-white">{FEED_EXAMPLE.likes} likes</p>
                <p className="mt-0.5 text-[0.62rem] leading-snug text-white/75">
                  <span className="font-semibold text-white">{FEED_EXAMPLE.handle}</span> {FEED_EXAMPLE.caption}
                </p>
                <p className="text-[0.56rem] text-mint">{FEED_EXAMPLE.tags}</p>
              </div>
              <div className="bg-white/[0.03] p-3">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-amber-300">Instagram Feed</p>
              </div>
            </div>
          </Reveal>

          {/* Instagram Story — same progress-bar-and-header chrome as the
              hero mockup above, so this reads as the same real template
              rather than a simplified stand-in for it. */}
          <Reveal delay={0.28} y={16}>
            <div className="overflow-hidden border border-white/10">
              <div className="relative aspect-[9/16] w-full bg-[#0a0a0a]">
                <img
                  src={STORY_EXAMPLE.photo}
                  alt=""
                  className="h-full w-full object-cover opacity-90 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />
                <div className="absolute inset-0 bg-amber-500/10" />

                <div className="absolute inset-x-2.5 top-2.5 flex gap-1">
                  <div className="h-[2px] flex-1 rounded-full bg-white" />
                  <div className="h-[2px] flex-1 rounded-full bg-white/30" />
                  <div className="h-[2px] flex-1 rounded-full bg-white/30" />
                </div>
                <div className="absolute inset-x-2.5 top-5 flex items-center gap-1.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[0.42rem] font-black text-[#241a0c]">
                    W
                  </span>
                  <p className="text-[0.56rem] font-semibold text-white">{STORY_EXAMPLE.handle}</p>
                </div>

                <div className="absolute inset-x-3 top-[42%]">
                  <p className="text-[1.05rem] font-black leading-tight text-white drop-shadow">
                    {STORY_EXAMPLE.headline}
                  </p>
                  <p className="mt-1 text-[0.6rem] text-white/80">{STORY_EXAMPLE.caption}</p>
                </div>

                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-lg">
                    <Link2 className="h-2.5 w-2.5 text-black" strokeWidth={2.6} />
                    <span className="text-[0.56rem] font-semibold text-black">rarezy.co.uk</span>
                  </span>
                </div>
              </div>
              <div className="bg-white/[0.03] p-3">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-amber-300">Instagram Story</p>
              </div>
            </div>
          </Reveal>

          {/* Email banner — the from/subject line it would actually sit
              under in an inbox, then a real "Shop now" button beneath the
              image rather than text baked into the photo, since that's
              how a clickable email banner is actually built. */}
          <Reveal delay={0.36} y={16}>
            <div className="overflow-hidden border border-white/10">
              <div className="bg-[#0d0d0d] px-3 py-2.5">
                <p className="text-[0.56rem] text-white/40">{EMAIL_EXAMPLE.from} &lt;hello@windsorwatchco.com&gt;</p>
                <p className="mt-0.5 truncate text-[0.66rem] font-semibold text-white">{EMAIL_EXAMPLE.subject}</p>
              </div>
              <div className="relative aspect-[16/9] w-full bg-[#0a0a0a]">
                <img
                  src={EMAIL_EXAMPLE.photo}
                  alt=""
                  className="h-full w-full object-cover opacity-90 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
                <div className="absolute inset-0 bg-amber-500/10" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[0.85rem] font-black leading-tight text-white drop-shadow">
                    {EMAIL_EXAMPLE.headline}
                  </p>
                </div>
              </div>
              <div className="bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[0.6rem] leading-snug text-white/60">{EMAIL_EXAMPLE.caption}</p>
                  <span className="shrink-0 rounded-md bg-amber-400 px-2.5 py-1.5 text-[0.6rem] font-bold text-[#241a0c]">
                    Shop now
                  </span>
                </div>
                <p className="mt-2.5 border-t border-white/10 pt-2.5 text-[0.62rem] uppercase tracking-[0.2em] text-amber-300">
                  Email banner
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={0.15 + i * 0.1} y={16}>
            <div className="flex items-start gap-3.5 border border-white/10 bg-white/[0.03] p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-amber-400/12">
                <s.Icon className="h-4 w-4 text-amber-300" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[0.88rem] font-semibold tracking-tight text-white">{s.title}</p>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-white/55">{s.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
