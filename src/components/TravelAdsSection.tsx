import { LIVE_TRAVEL_ADS } from "@/lib/affiliates";
import { AffiliateWidgetEmbed } from "@/components/AffiliateWidgetEmbed";
import { Reveal } from "@/components/Reveal";

/**
 * Real, signed travel partner embeds (eSIM data, flight search) at the
 * very bottom of the Home page — presented as ordinary recommended
 * services for someone about to travel with what they just won, not
 * labelled "affiliate" anywhere in the UI, same house rule as every other
 * partner card on the site.
 */
export function TravelAdsSection() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Reveal className="text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">Before you fly</p>
        <p className="mt-4 text-[1.5rem] font-bold leading-[1.1] tracking-[-0.015em] text-white">
          Just won a trip-worthy watch? Get ready to travel with it.
        </p>
      </Reveal>

      <div className="mt-8 flex flex-col gap-6">
        {LIVE_TRAVEL_ADS.map((ad, i) => (
          <Reveal key={ad.id} delay={0.08 + i * 0.08}>
            <p className="text-[0.78rem] text-white/55">{ad.blurb}</p>
            <div className="mt-3 overflow-hidden rounded-none">
              <AffiliateWidgetEmbed src={ad.widgetSrc} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
