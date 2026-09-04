import { Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AuthGateRedirect } from "@/components/AuthGateRedirect";
import { CookieBanner } from "@/components/CookieBanner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Home } from "@/pages/Home";
import { Browse } from "@/pages/Browse";
import { ItemDetail } from "@/pages/ItemDetail";
import { Watchlist } from "@/pages/Watchlist";
import { Basket } from "@/pages/Basket";
import { Entries } from "@/pages/Entries";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Partners } from "@/pages/Partners";
import { Authenticate } from "@/pages/Authenticate";
import { Sell } from "@/pages/Sell";
import { MyAccount } from "@/pages/MyAccount";
import { Admin } from "@/pages/Admin";
import { Certificate } from "@/pages/Certificate";
import { Payments } from "@/pages/Payments";
import { HowItWorks } from "@/pages/HowItWorks";
import { Help } from "@/pages/Help";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";

export function App() {
  return (
    <div className="flex min-h-full flex-col">
      {/* One continuous background behind every page, fixed to the viewport —
          the nav, footer and every page's content sit in their own `relative
          z-10` stacking context above it, so scrolling anywhere on the site
          reveals more of the same drifting mesh rather than a flat page
          background. `.grain` sets `position: relative` on itself, which
          would otherwise fight the `fixed` positioning needed here — forced
          via inline style since that always wins regardless of cascade order. */}
      <div className="mesh-hero grain inset-0 z-0" style={{ position: "fixed" }} aria-hidden />

      <ScrollToTop />
      <NavBar />
      <div className="relative z-10 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/item/:itemId" element={<ItemDetail />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/certificate/:listingId" element={<Certificate />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
      <Footer />
      <AuthGateRedirect />
      <CookieBanner />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
