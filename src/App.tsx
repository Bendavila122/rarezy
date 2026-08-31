import { Route, Routes } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Landing } from "@/pages/Landing";
import { Browse } from "@/pages/Browse";
import { ItemDetail } from "@/pages/ItemDetail";
import { Sell } from "@/pages/Sell";
import { MyAccount } from "@/pages/MyAccount";

export function App() {
  return (
    <div className="min-h-full">
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/item/:itemId" element={<ItemDetail />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/account" element={<MyAccount />} />
      </Routes>
    </div>
  );
}
