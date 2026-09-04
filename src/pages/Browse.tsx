import { BrowseSection } from "@/components/BrowseSection";
import { AccountRequired } from "@/components/AccountRequired";
import { useRarezy } from "@/lib/store";

/** Its own tab again — search, filters and the full watch grid, not folded into the home page. */
export function Browse() {
  const { currentUser } = useRarezy();

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to browse"
        body="Sign up free to see every competition and start winning."
      />
    );
  }

  return <BrowseSection />;
}
