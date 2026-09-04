/**
 * The real, shared-database side of the marketplace — sellers, their
 * products and competitions, entries, scores — as opposed to `store.ts`,
 * which is the pre-existing single-browser `localStorage` model still used
 * for the legacy "sell your own watch to Rarezy" flow and its seed
 * catalogue. Every read/write here goes through Supabase (RLS-enforced,
 * with `purchase_entries`/`record_score` as the only paths that can ever
 * mutate money- or score-related fields — see the `marketplace_core`
 * migration for why).
 */
import { supabase } from "./supabaseClient";
import { money } from "./marketplace";

export const moneyFromPence = (pence: number) => money(pence / 100);

export type SellerStatus = "submitted" | "under_review" | "approved" | "rejected" | "suspended" | "banned";

export type Seller = {
  id: string;
  ownerId: string;
  businessName: string;
  tradingName: string | null;
  companyNumber: string | null;
  country: string;
  website: string | null;
  contactEmail: string;
  contactPhone: string | null;
  category: "watches" | "jewellery" | "other";
  yearsTrading: number | null;
  status: SellerStatus;
  complianceNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
};

export type ProductCategory = "watch" | "jewellery" | "handbag" | "clothing" | "electronics" | "other";
export type ProductStatus = "draft" | "pending_approval" | "approved" | "rejected";
export type ProductImage = { id: string; url: string; imageType: string | null; sortOrder: number };

export type Product = {
  id: string;
  sellerId: string;
  category: ProductCategory;
  brand: string;
  model: string;
  reference: string | null;
  year: number | null;
  condition: "new" | "excellent" | "good" | "fair";
  retailValuePence: number;
  description: string;
  box: boolean;
  papers: boolean;
  accessories: string | null;
  status: ProductStatus;
  adminNotes: string | null;
  createdAt: string;
  images: ProductImage[];
};

export type CompetitionStatus =
  | "draft"
  | "pending_approval"
  | "live"
  | "completed"
  | "winner_pending"
  | "fulfilment_pending"
  | "fulfilled"
  | "payout_pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "rejected";

export type MarketCompetition = {
  id: string;
  sellerId: string;
  productId: string;
  ticketPricePence: number;
  maxEntries: number;
  entriesSold: number;
  endsAt: string;
  status: CompetitionStatus;
  adminNotes: string | null;
  winnerUserId: string | null;
  winnerScore: number | null;
  createdAt: string;
  product: Product;
  seller: Seller;
};

function db() {
  if (!supabase) throw new Error("Supabase isn't configured in this environment.");
  return supabase;
}

const mapSeller = (row: Record<string, unknown>): Seller => ({
  id: row.id as string,
  ownerId: row.owner_id as string,
  businessName: row.business_name as string,
  tradingName: (row.trading_name as string) ?? null,
  companyNumber: (row.company_number as string) ?? null,
  country: row.country as string,
  website: (row.website as string) ?? null,
  contactEmail: row.contact_email as string,
  contactPhone: (row.contact_phone as string) ?? null,
  category: row.category as Seller["category"],
  yearsTrading: (row.years_trading as number) ?? null,
  status: row.status as SellerStatus,
  complianceNotes: (row.compliance_notes as string) ?? null,
  adminNotes: (row.admin_notes as string) ?? null,
  createdAt: row.created_at as string,
});

const mapProduct = (row: Record<string, unknown>): Product => ({
  id: row.id as string,
  sellerId: row.seller_id as string,
  category: row.category as ProductCategory,
  brand: row.brand as string,
  model: row.model as string,
  reference: (row.reference as string) ?? null,
  year: (row.year as number) ?? null,
  condition: row.condition as Product["condition"],
  retailValuePence: row.retail_value_pence as number,
  description: row.description as string,
  box: row.box as boolean,
  papers: row.papers as boolean,
  accessories: (row.accessories as string) ?? null,
  status: row.status as ProductStatus,
  adminNotes: (row.admin_notes as string) ?? null,
  createdAt: row.created_at as string,
  images: ((row.product_images as Record<string, unknown>[]) ?? [])
    .map((i) => ({
      id: i.id as string,
      url: i.url as string,
      imageType: (i.image_type as string) ?? null,
      sortOrder: i.sort_order as number,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder),
});

const mapCompetition = (row: Record<string, unknown>): MarketCompetition => ({
  id: row.id as string,
  sellerId: row.seller_id as string,
  productId: row.product_id as string,
  ticketPricePence: row.ticket_price_pence as number,
  maxEntries: row.max_entries as number,
  entriesSold: row.entries_sold as number,
  endsAt: row.ends_at as string,
  status: row.status as CompetitionStatus,
  adminNotes: (row.admin_notes as string) ?? null,
  winnerUserId: (row.winner_user_id as string) ?? null,
  winnerScore: (row.winner_score as number) ?? null,
  createdAt: row.created_at as string,
  product: mapProduct(row.products as Record<string, unknown>),
  seller: mapSeller(row.sellers as Record<string, unknown>),
});

const COMPETITION_SELECT = "*, products(*, product_images(*)), sellers(*)";

export const marketDb = {
  // ---- Seller ----
  async fetchMySeller(userId: string): Promise<Seller | null> {
    const { data, error } = await db().from("sellers").select("*").eq("owner_id", userId).maybeSingle();
    if (error) throw error;
    return data ? mapSeller(data) : null;
  },

  async applyAsSeller(input: {
    ownerId: string;
    businessName: string;
    tradingName?: string | undefined;
    country: string;
    website?: string | undefined;
    contactEmail: string;
    contactPhone?: string | undefined;
    category: Seller["category"];
    yearsTrading?: number | undefined;
  }) {
    const { data, error } = await db()
      .from("sellers")
      .insert({
        owner_id: input.ownerId,
        business_name: input.businessName,
        trading_name: input.tradingName || null,
        country: input.country,
        website: input.website || null,
        contact_email: input.contactEmail,
        contact_phone: input.contactPhone || null,
        category: input.category,
        years_trading: input.yearsTrading ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapSeller(data);
  },

  // ---- Products ----
  async createProduct(sellerId: string, input: Omit<Product, "id" | "sellerId" | "status" | "adminNotes" | "createdAt" | "images">) {
    const { data, error } = await db()
      .from("products")
      .insert({
        seller_id: sellerId,
        category: input.category,
        brand: input.brand,
        model: input.model,
        reference: input.reference || null,
        year: input.year || null,
        condition: input.condition,
        retail_value_pence: input.retailValuePence,
        description: input.description,
        box: input.box,
        papers: input.papers,
        accessories: input.accessories || null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapProduct({ ...data, product_images: [] });
  },

  async uploadProductImage(sellerId: string, productId: string, file: File, sortOrder: number) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${sellerId}/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await db().storage.from("product-images").upload(path, file);
    if (uploadError) throw uploadError;
    const { data: publicUrl } = db().storage.from("product-images").getPublicUrl(path);
    const { error: insertError } = await db()
      .from("product_images")
      .insert({ product_id: productId, url: publicUrl.publicUrl, sort_order: sortOrder });
    if (insertError) throw insertError;
    return publicUrl.publicUrl;
  },

  async submitProductForApproval(productId: string) {
    const { error } = await db().from("products").update({ status: "pending_approval" }).eq("id", productId);
    if (error) throw error;
  },

  // ---- Competitions ----
  async createCompetition(sellerId: string, input: { productId: string; ticketPricePence: number; maxEntries: number; endsAt: string }) {
    const { data, error } = await db()
      .from("competitions")
      .insert({
        seller_id: sellerId,
        product_id: input.productId,
        ticket_price_pence: input.ticketPricePence,
        max_entries: input.maxEntries,
        ends_at: input.endsAt,
      })
      .select()
      .single();
    if (error) throw error;
    return data.id as string;
  },

  async submitCompetitionForApproval(competitionId: string) {
    const { error } = await db().from("competitions").update({ status: "pending_approval" }).eq("id", competitionId);
    if (error) throw error;
  },

  async fetchLiveCompetitions(): Promise<MarketCompetition[]> {
    const { data, error } = await db()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("status", "live")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCompetition(r as unknown as Record<string, unknown>));
  },

  async fetchCompetition(id: string): Promise<MarketCompetition | null> {
    const { data, error } = await db().from("competitions").select(COMPETITION_SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapCompetition(data as unknown as Record<string, unknown>) : null;
  },

  async fetchMyCompetitions(sellerId: string): Promise<MarketCompetition[]> {
    const { data, error } = await db()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCompetition(r as unknown as Record<string, unknown>));
  },

  // ---- Entries & the skill game ----
  async purchaseEntries(competitionId: string, quantity: number) {
    const { error } = await db().rpc("purchase_entries", { p_competition_id: competitionId, p_quantity: quantity });
    if (error) throw error;
  },

  async myAttempts(competitionId: string, userId: string) {
    const [{ data: entries, error: entriesError }, { data: scores, error: scoresError }] = await Promise.all([
      db().from("entries").select("quantity").eq("competition_id", competitionId).eq("user_id", userId),
      db().from("scores").select("score").eq("competition_id", competitionId).eq("user_id", userId),
    ]);
    if (entriesError) throw entriesError;
    if (scoresError) throw scoresError;
    const owed = (entries ?? []).reduce((sum, e) => sum + (e.quantity as number), 0);
    const used = (scores ?? []).length;
    const best = (scores ?? []).reduce((max, s) => Math.max(max, s.score as number), 0);
    return { owed, used, remaining: Math.max(0, owed - used), bestScore: scores && scores.length > 0 ? best : undefined };
  },

  async recordScore(competitionId: string, score: number) {
    const { data, error } = await db().rpc("record_score", { p_competition_id: competitionId, p_score: score });
    if (error) throw error;
    return data as number;
  },

  async fetchLeaderboard(competitionId: string) {
    const { data, error } = await db()
      .from("competition_leaderboard")
      .select("username, best_score")
      .eq("competition_id", competitionId)
      .order("best_score", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((r) => ({ name: r.username as string, score: r.best_score as number }));
  },

  // ---- Public storefront ----
  async fetchPublicSeller(id: string): Promise<Seller | null> {
    const { data, error } = await db().from("sellers").select("*").eq("id", id).eq("status", "approved").maybeSingle();
    if (error) throw error;
    return data ? mapSeller(data) : null;
  },

  async fetchSellerLiveCompetitions(sellerId: string): Promise<MarketCompetition[]> {
    const { data, error } = await db()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("seller_id", sellerId)
      .in("status", ["live", "completed", "winner_pending", "fulfilment_pending", "fulfilled", "payout_pending", "paid"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCompetition(r as unknown as Record<string, unknown>));
  },

  // ---- Admin ----
  async fetchPendingSellers(): Promise<Seller[]> {
    const { data, error } = await db()
      .from("sellers")
      .select("*")
      .in("status", ["submitted", "under_review"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSeller);
  },

  async approveSeller(id: string) {
    const { error } = await db().from("sellers").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async rejectSeller(id: string, reason: string) {
    const { error } = await db()
      .from("sellers")
      .update({ status: "rejected", admin_notes: reason, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async fetchPendingCompetitions(): Promise<MarketCompetition[]> {
    const { data, error } = await db()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCompetition(r as unknown as Record<string, unknown>));
  },

  async approveCompetition(competitionId: string, productId: string) {
    const { error: productError } = await db().from("products").update({ status: "approved" }).eq("id", productId);
    if (productError) throw productError;
    const { error } = await db().from("competitions").update({ status: "live" }).eq("id", competitionId);
    if (error) throw error;
  },

  async rejectCompetition(competitionId: string, reason: string) {
    const { error } = await db().from("competitions").update({ status: "rejected", admin_notes: reason }).eq("id", competitionId);
    if (error) throw error;
  },
};
