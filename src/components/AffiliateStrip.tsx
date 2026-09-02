import { Link } from "react-router-dom";
import { FEATURED_AFFILIATES } from "@/lib/affiliates";

const MEDIA: Record<string, { video: string; poster: string }> = {
  travel: { video: "/videos/travel.mp4", poster: "/videos/travel-poster.png" },
  insurance: { video: "/videos/insurance.mp4", poster: "/videos/insurance-poster.png" },
  authentication: { video: "/videos/authentication.mp4", poster: "/videos/authentication-poster.png" },
};

/**
 * Three recommended partner services, presented as ordinary trust/utility
 * cards — never labelled "affiliate". Deliberately standalone: contained
 * within the page's usual max-width, gapped from each other and from the
 * screen edges, each reading as its own separate advert rather than a
 * merged full-bleed strip.
 */
export function AffiliateStrip() {
  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-6 py-16">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {FEATURED_AFFILIATES.map((a) => {
          const media = MEDIA[a.id];

          const panel = (
            <div className="group relative h-64 w-full overflow-hidden">
              {media && (
                <video
                  src={media.video}
                  poster={media.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
              <div className="relative z-[2] flex h-full flex-col justify-end p-5">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-mint">{a.category}</p>
                <p className="mt-1.5 text-[1rem] font-semibold leading-snug text-white">{a.headline}</p>
              </div>
            </div>
          );

          return a.href ? (
            <Link key={a.id} to={a.href} className="block">
              {panel}
            </Link>
          ) : (
            <div key={a.id}>{panel}</div>
          );
        })}
      </div>
    </div>
  );
}
