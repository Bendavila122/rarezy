import { Link } from "react-router-dom";
import { useRarezy, type CompetitionListing } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { AccountRequired } from "@/components/AccountRequired";

export function Watchlist() {
  const { records, watchlist, currentUser } = useRarezy();
  const watched = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && watchlist.includes(r.id),
  );

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to save watches"
        body="Sign up to keep a watchlist of the pieces you're keeping an eye on."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Watchlist</h1>
      <p className="mt-2 text-[0.85rem] text-muted">Watches you've saved to keep an eye on.</p>

      {watched.length === 0 ? (
        <p className="mt-14 text-center text-[0.9rem] text-muted">
          Nothing saved yet.{" "}
          <Link to="/browse" className="text-brand underline underline-offset-4">
            Browse watches
          </Link>{" "}
          and tap the heart on any listing.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {watched.map((c) => (
            <ListingCard key={c.id} listing={c} />
          ))}
        </div>
      )}
    </div>
  );
}
