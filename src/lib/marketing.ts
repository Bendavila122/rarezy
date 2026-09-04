/**
 * Client side of the AI Marketing Centre. Generation itself always happens
 * server-side (the `generate-marketing-*`/`check-marketing-image` edge
 * functions) — this module just invokes those functions and reads back the
 * `marketing_assets` rows they write. No AI provider key ever touches the
 * client.
 */
import { supabase } from "./supabaseClient";

export type MarketingChannel = "instagram_feed" | "instagram_story" | "tiktok" | "meta_ad" | "email" | "whatsapp";

export type InstagramFeedContent = { headline: string; caption: string; cta: string; hashtags: string[] };
export type InstagramStoryContent = { frames: { text: string }[] };
export type TikTokContent = {
  hook: string;
  script: string;
  onScreenText: string[];
  caption: string;
  cta: string;
  hashtags: string[];
  suggestedDurationSec: number;
};
export type MetaAdContent = { angle: string; primaryText: string; headline: string; description: string; cta: string };
export type EmailContent = { variant: string; subject: string; preview: string; header: string; body: string; cta: string };
export type WhatsAppContent = { message: string };

export type MarketingAsset = {
  id: string;
  campaignId: string;
  channel: MarketingChannel;
  angle: string | null;
  variant: string | null;
  content: unknown;
  imageUrl: string | null;
  status: "generating" | "ready" | "failed";
  createdAt: string;
};

const IMAGE_CHANNELS: MarketingChannel[] = ["instagram_feed"];

function db() {
  if (!supabase) throw new Error("Supabase isn't configured in this environment.");
  return supabase;
}

function mapAsset(row: Record<string, unknown>): MarketingAsset {
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    channel: row.channel as MarketingChannel,
    angle: (row.angle as string) ?? null,
    variant: (row.variant as string) ?? null,
    content: row.content,
    imageUrl: (row.image_url as string) ?? null,
    status: row.status as MarketingAsset["status"],
    createdAt: row.created_at as string,
  };
}

async function authHeader() {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return { Authorization: `Bearer ${token}` };
}

async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().functions.invoke(name, { body, headers: await authHeader() });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const marketingCentre = {
  channelNeedsImage: (channel: MarketingChannel) => IMAGE_CHANNELS.includes(channel),

  /** Generates the text content for one channel — always a fresh row, so "regenerate" is just calling this again. */
  async generateText(
    competitionId: string,
    channel: MarketingChannel,
    opts?: { angle?: string | undefined; variant?: string | undefined; assetId?: string | undefined },
  ) {
    const { asset } = await callFunction<{ asset: Record<string, unknown> }>("generate-marketing-text", {
      competitionId,
      channel,
      angle: opts?.angle,
      variant: opts?.variant,
      assetId: opts?.assetId,
    });
    return mapAsset(asset);
  },

  /** Kicks off the (async) creative image for a channel — poll with checkImage until status leaves "generating". */
  async generateImage(competitionId: string, channel: MarketingChannel, campaignId?: string) {
    const { asset } = await callFunction<{ asset: Record<string, unknown> }>("generate-marketing-image", {
      competitionId,
      channel,
      campaignId,
    });
    return mapAsset(asset);
  },

  async checkImage(assetId: string) {
    const { asset } = await callFunction<{ asset: Record<string, unknown> }>("check-marketing-image", { assetId });
    return mapAsset(asset);
  },

  async fetchCampaignAssets(competitionId: string): Promise<MarketingAsset[]> {
    const { data, error } = await db()
      .from("marketing_assets")
      .select("*, marketing_campaigns!inner(competition_id)")
      .eq("marketing_campaigns.competition_id", competitionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => mapAsset(r as unknown as Record<string, unknown>));
  },

  async deleteAsset(id: string) {
    const { error } = await db().from("marketing_assets").delete().eq("id", id);
    if (error) throw error;
  },
};
