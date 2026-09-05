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
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  about: string | null;
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
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

export type FulfilmentStatus = "pending" | "preparing" | "dispatched" | "delivered" | "confirmed";
export type Fulfilment = {
  competitionId: string;
  status: FulfilmentStatus;
  carrier: string | null;
  trackingNumber: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
};

export type DisputeType = "not_received" | "materially_different" | "damaged" | "wrong_product" | "other";
export type DisputeStatus = "open" | "awaiting_seller" | "awaiting_customer" | "resolved" | "escalated";
export type Dispute = {
  id: string;
  competitionId: string;
  userId: string;
  sellerId: string;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: string;
  competition?: MarketCompetition | undefined;
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
  logoUrl: (row.logo_url as string) ?? null,
  coverPhotoUrl: (row.cover_photo_url as string) ?? null,
  about: (row.about as string) ?? null,
  locationLabel: (row.location_label as string) ?? null,
  locationLat: (row.location_lat as number) ?? null,
  locationLng: (row.location_lng as number) ?? null,
  instagramUrl: (row.instagram_url as string) ?? null,
  facebookUrl: (row.facebook_url as string) ?? null,
  twitterUrl: (row.twitter_url as string) ?? null,
  tiktokUrl: (row.tiktok_url as string) ?? null,
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

  /** Everything a seller can customise about their public storefront, beyond the application fields set at signup. */
  async updateSellerProfile(
    sellerId: string,
    fields: {
      about?: string | null;
      contactPhone?: string | null;
      website?: string | null;
      locationLabel?: string | null;
      locationLat?: number | null;
      locationLng?: number | null;
      instagramUrl?: string | null;
      facebookUrl?: string | null;
      twitterUrl?: string | null;
      tiktokUrl?: string | null;
    },
  ) {
    const patch: Record<string, unknown> = {};
    if (fields.about !== undefined) patch.about = fields.about;
    if (fields.contactPhone !== undefined) patch.contact_phone = fields.contactPhone;
    if (fields.website !== undefined) patch.website = fields.website;
    if (fields.locationLabel !== undefined) patch.location_label = fields.locationLabel;
    if (fields.locationLat !== undefined) patch.location_lat = fields.locationLat;
    if (fields.locationLng !== undefined) patch.location_lng = fields.locationLng;
    if (fields.instagramUrl !== undefined) patch.instagram_url = fields.instagramUrl;
    if (fields.facebookUrl !== undefined) patch.facebook_url = fields.facebookUrl;
    if (fields.twitterUrl !== undefined) patch.twitter_url = fields.twitterUrl;
    if (fields.tiktokUrl !== undefined) patch.tiktok_url = fields.tiktokUrl;

    const { error } = await db().from("sellers").update(patch).eq("id", sellerId);
    if (error) throw error;
  },

  /** Uploads a new logo or cover photo, replacing any previous one at the same path, and saves the public URL onto the seller row. */
  async uploadSellerImage(sellerId: string, kind: "logo" | "cover", file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${sellerId}/${kind}.${ext}`;
    const { error: uploadError } = await db()
      .storage.from("seller-branding")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) throw uploadError;
    const { data: publicUrl } = db().storage.from("seller-branding").getPublicUrl(path);
    const url = `${publicUrl.publicUrl}?v=${Date.now()}`;
    const column = kind === "logo" ? "logo_url" : "cover_photo_url";
    const { error: updateError } = await db()
      .from("sellers")
      .update({ [column]: url })
      .eq("id", sellerId);
    if (updateError) throw updateError;
    return url;
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

  async fetchUsername(userId: string): Promise<string | null> {
    const { data, error } = await db().from("profiles").select("username").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data?.username ?? null;
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

  // ---- Winner resolution & fulfilment ----

  /** No scheduled job in this project — call lazily whenever a competition whose deadline may have passed is loaded, same pattern as the legacy store's own deadline sweep. Safe to call repeatedly; a no-op once already resolved. */
  async resolveIfDue(competitionId: string) {
    const { error } = await db().rpc("resolve_competition", { p_competition_id: competitionId });
    if (error) throw error;
  },

  async fetchMyWins(userId: string): Promise<MarketCompetition[]> {
    const { data, error } = await db()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("winner_user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapCompetition(r as unknown as Record<string, unknown>));
  },

  async fetchFulfilment(competitionId: string): Promise<Fulfilment | null> {
    const { data, error } = await db().from("fulfilments").select("*").eq("competition_id", competitionId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      competitionId: data.competition_id,
      status: data.status,
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      dispatchedAt: data.dispatched_at,
      deliveredAt: data.delivered_at,
    };
  },

  async markDispatched(competitionId: string, carrier: string, trackingNumber: string) {
    const { error } = await db().rpc("mark_dispatched", {
      p_competition_id: competitionId,
      p_carrier: carrier,
      p_tracking: trackingNumber,
    });
    if (error) throw error;
  },

  async markDelivered(competitionId: string) {
    const { error } = await db().rpc("mark_delivered", { p_competition_id: competitionId });
    if (error) throw error;
  },

  // ---- Disputes ----

  async openDispute(input: { competitionId: string; userId: string; sellerId: string; type: DisputeType; description: string }) {
    const { error } = await db().from("disputes").insert({
      competition_id: input.competitionId,
      user_id: input.userId,
      seller_id: input.sellerId,
      type: input.type,
      description: input.description,
    });
    if (error) throw error;
  },

  async fetchMyDisputes(userId: string): Promise<Dispute[]> {
    const { data, error } = await db().from("disputes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      competitionId: d.competition_id,
      userId: d.user_id,
      sellerId: d.seller_id,
      type: d.type,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      createdAt: d.created_at,
    }));
  },

  async fetchOpenDisputes(): Promise<Dispute[]> {
    const { data, error } = await db()
      .from("disputes")
      .select(`*, competitions(${COMPETITION_SELECT})`)
      .neq("status", "resolved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      competitionId: d.competition_id,
      userId: d.user_id,
      sellerId: d.seller_id,
      type: d.type,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      createdAt: d.created_at,
      competition: d.competitions ? mapCompetition(d.competitions as unknown as Record<string, unknown>) : undefined,
    }));
  },

  async resolveDispute(id: string, resolution: string) {
    const { error } = await db()
      .from("disputes")
      .update({ status: "resolved", resolution, resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // ---- Seller ledger ----
  async fetchSellerLedgerSummary(sellerId: string) {
    const { data, error } = await db().from("seller_ledger_entries").select("amount_pence, status, type").eq("seller_id", sellerId);
    if (error) throw error;
    const rows = data ?? [];
    const pendingPence = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount_pence, 0);
    const availablePence = rows.filter((r) => r.status === "available").reduce((s, r) => s + r.amount_pence, 0);
    const paidPence = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount_pence, 0);
    return { pendingPence, availablePence, paidPence };
  },
};
