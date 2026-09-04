// Supabase Edge Function: turns the seller's own uploaded product photo
// into a marketing creative — this is image EDITING (Seedream's `/edit`
// model, which takes a real source image), not text-to-image generation.
// The point is an advertisement for *this exact item*, not an AI likeness
// of one: a winner has to receive what was pictured, so the product photo
// itself is the input, never hallucinated from a text description alone.
// Takes roughly a minute, well past a sensible request timeout, so this
// only submits the job — check-marketing-image resolves it once the
// client polls.
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ATLASCLOUD_API_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Not signed in");

    const { competitionId, channel, campaignId } = await req.json();
    if (!competitionId || !channel) throw new Error("Missing competitionId or channel");

    const { data: competition, error: compError } = await supabase
      .from("competitions")
      .select("*, products(*, product_images(*)), sellers(*)")
      .eq("id", competitionId)
      .single();
    if (compError || !competition) throw new Error("Competition not found");
    if (competition.sellers.owner_id !== user.id) throw new Error("Not authorised");

    const sourceImages: string[] = (competition.products.product_images ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((i: { url: string }) => i.url);
    if (sourceImages.length === 0) {
      throw new Error("This product has no uploaded photos to turn into a creative yet");
    }

    let resolvedCampaignId = campaignId;
    if (!resolvedCampaignId) {
      const { data: campaign, error: campaignError } = await supabase
        .from("marketing_campaigns")
        .insert({ competition_id: competitionId, seller_id: competition.seller_id })
        .select()
        .single();
      if (campaignError) throw campaignError;
      resolvedCampaignId = campaign.id;
    }

    const prompt =
      `Turn this exact product photo into a premium social-media marketing creative. ` +
      `Place it on a premium dark studio background with soft dramatic lighting and subtle depth, ` +
      `add clean empty negative space in the upper third of the frame suitable for a headline to be ` +
      `overlaid afterwards. Keep the product itself completely unchanged — identical shape, colour, ` +
      `material, markings and angle as the source photo. Do not add any text, logos or watermark, and ` +
      `do not alter, replace or reinterpret the product in any way. Square 1:1 composition, ultra-detailed.`;

    const atlasRes = await fetch("https://api.atlascloud.ai/api/v1/model/generateImage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("ATLASCLOUD_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "bytedance/seedream-v5.0-pro/edit",
        prompt,
        images: [sourceImages[0]],
        size: "1024*1024",
      }),
    });
    if (!atlasRes.ok) throw new Error(`AtlasCloud error: ${await atlasRes.text()}`);
    const atlasData = await atlasRes.json();
    const jobId = atlasData.data.id;

    const { data: asset, error: assetError } = await supabase
      .from("marketing_assets")
      .insert({
        campaign_id: resolvedCampaignId,
        seller_id: competition.seller_id,
        channel,
        status: "generating",
        provider_job_id: jobId,
      })
      .select()
      .single();
    if (assetError) throw assetError;

    return new Response(JSON.stringify({ ok: true, asset }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 500,
      headers: CORS,
    });
  }
});
