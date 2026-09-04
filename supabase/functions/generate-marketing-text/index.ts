// Supabase Edge Function: generates the copy for one marketing-asset
// channel (Instagram feed/story, TikTok, a Meta ad angle, an email
// variant, or a WhatsApp message) using Anthropic's API, and inserts the
// resulting marketing_assets row. The seller pays nothing for this —
// Rarezy's own ANTHROPIC_API_KEY is used server-side; never sent to the
// client.
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pinned to a real, currently-available Anthropic model — bump this
// string when a newer one should be used instead.
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";

type Channel = "instagram_feed" | "instagram_story" | "tiktok" | "meta_ad" | "email" | "whatsapp";

const SYSTEM_PROMPT = `You are Rarezy's in-house marketing copywriter for luxury dealers.

Rarezy is a luxury competition marketplace: verified jewellery and watch
businesses list their own stock as skill-based competitions; customers pay
a small entry fee for a chance to win; the dealer ships the prize directly.

The single most important rule: every piece of copy you write promotes the
DEALER and their PRODUCT first. The dealer must feel this is their own
campaign, not an advert for Rarezy. Rarezy should appear only as a subtle
mention — "hosted on Rarezy" / "powered by Rarezy" / the platform where
entry happens — never as the headline act.

Write in a premium, confident, luxury tone. Never sound like a cut-price
raffle site. No excessive exclamation marks, no "!!!", no clickbait
gambling language ("GUARANTEED WIN", etc.) — this is a skill-based
competition, entries have a real, disclosed cost, and the tone should feel
closer to a luxury boutique than a prize-site.

Respond with ONLY valid JSON matching the exact schema given in the user
message. No markdown fences, no commentary, no extra keys.`;

function buildUserPrompt(input: {
  channel: Channel;
  angle: string;
  variant: string;
  brand: string;
  model: string;
  reference: string | null;
  condition: string;
  retailValuePounds: number;
  ticketPricePounds: number;
  maxEntries: number;
  endsAt: string;
  gameName: string;
  sellerName: string;
  competitionUrl: string;
}) {
  const base = `Product: ${input.brand} ${input.model}${input.reference ? ` (ref ${input.reference})` : ""}
Condition: ${input.condition}
Retail/reference value: £${input.retailValuePounds.toLocaleString("en-GB")}
Entry price: £${input.ticketPricePounds}
Maximum entries: ${input.maxEntries.toLocaleString("en-GB")}
Closes: ${input.endsAt}
Skill game: ${input.gameName}
Dealer: ${input.sellerName}
Competition link: ${input.competitionUrl}
Requested creative angle: ${input.angle}`;

  switch (input.channel) {
    case "instagram_feed":
      return `${base}

Write an Instagram feed post for this competition.
Respond with JSON: { "headline": string, "caption": string, "cta": string, "hashtags": string[] }
- headline: a short, punchy line suitable for overlaying on the product image (under 8 words)
- caption: 2-4 sentences, dealer-first tone
- cta: a short call to action (e.g. "Enter now — link in bio")
- hashtags: 6-10 relevant hashtags, mixing the brand, luxury/watch or jewellery community tags, and one Rarezy tag`;

    case "instagram_story": {
      const dur = input.variant === "last_chance" ? "closing soon, urgent" : "launch, exciting";
      return `${base}
Story tone: ${dur}

Write a 5-frame Instagram Story sequence for this competition, each frame a
single short line of on-screen text (the kind you'd see over a product
photo), building from hook to CTA.
Respond with JSON: { "frames": [{ "text": string }] } with exactly 5 items.`;
    }

    case "tiktok":
      return `${base}

Write a native-feeling TikTok concept for this competition — not a copy of
an Instagram caption.
Respond with JSON: { "hook": string, "script": string, "onScreenText": string[], "caption": string, "cta": string, "hashtags": string[], "suggestedDurationSec": number }
- hook: the first 1-3 seconds, written to stop the scroll
- script: a short shot-by-shot or beat-by-beat spoken/voiceover script
- onScreenText: 3-6 short on-screen text overlays in sequence
- hashtags: 5-8 TikTok-native tags`;

    case "meta_ad":
      return `${base}

Write a Meta (Facebook/Instagram) ad creative for this competition, from
the "${input.angle}" angle specifically.
Respond with JSON: { "angle": string, "primaryText": string, "headline": string, "description": string, "cta": string }
- headline: under 40 characters
- primaryText: 2-3 sentences
- cta: one of "Shop Now" / "Learn More" / "Sign Up" style short phrases`;

    case "email": {
      const variant = input.variant || "launch";
      return `${base}
Email variant: ${variant} (one of launch / reminder / last_chance / final_hours)

Write a complete marketing email for this competition, matching the
"${variant}" moment in the competition's lifecycle.
Respond with JSON: { "variant": string, "subject": string, "preview": string, "header": string, "body": string, "cta": string }
- subject: under 60 characters
- preview: the inbox preview line, under 90 characters
- header: a short heading for the top of the email
- body: 3-5 short paragraphs of email copy (plain text, no HTML)`;
    }

    case "whatsapp":
      return `${base}

Write a short, natural WhatsApp message a dealer could send to their
existing customer list about this competition — conversational, not
salesy, like a personal update from the shop.
Respond with JSON: { "message": string }`;
  }
}

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

    const { competitionId, channel, angle, variant, assetId } = await req.json();
    if (!competitionId || !channel) throw new Error("Missing competitionId or channel");

    const { data: competition, error: compError } = await supabase
      .from("competitions")
      .select("*, products(*), sellers(*)")
      .eq("id", competitionId)
      .single();
    if (compError || !competition) throw new Error("Competition not found");
    if (competition.sellers.owner_id !== user.id) throw new Error("Not authorised");

    // `assetId` means "attach this copy to an image-generation row that's
    // already in flight" (instagram_feed) rather than create a standalone
    // text-only asset — keeps one Instagram post as one row with both an
    // image and a caption, instead of two unrelated rows.
    let campaignId: string;
    if (assetId) {
      const { data: existing, error: existingError } = await supabase
        .from("marketing_assets")
        .select("campaign_id, seller_id")
        .eq("id", assetId)
        .single();
      if (existingError || !existing) throw new Error("Asset not found");
      if (existing.seller_id !== competition.seller_id) throw new Error("Not authorised");
      campaignId = existing.campaign_id;
    } else {
      const { data: campaign, error: campaignError } = await supabase
        .from("marketing_campaigns")
        .insert({ competition_id: competitionId, seller_id: competition.seller_id })
        .select()
        .single();
      if (campaignError) throw campaignError;
      campaignId = campaign.id;
    }

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://rarezy.co.uk";
    const prompt = buildUserPrompt({
      channel,
      angle: angle || "luxury",
      variant: variant || "launch",
      brand: competition.products.brand,
      model: competition.products.model,
      reference: competition.products.reference,
      condition: competition.products.condition,
      retailValuePounds: competition.products.retail_value_pence / 100,
      ticketPricePounds: competition.ticket_price_pence / 100,
      maxEntries: competition.max_entries,
      endsAt: new Date(competition.ends_at).toLocaleDateString("en-GB"),
      gameName: "Rarezy 2048",
      sellerName: competition.sellers.business_name,
      competitionUrl: `${siteUrl}/c/${competitionId}`,
    });

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      throw new Error(`Anthropic API error: ${errText}`);
    }
    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text ?? "{}";
    const content = JSON.parse(rawText);

    let asset;
    if (assetId) {
      // Only touch `content`/angle/variant — never overwrite the image
      // generation's own status/image_url columns on this same row.
      const { data, error: assetError } = await supabase
        .from("marketing_assets")
        .update({ angle: angle || null, variant: variant || null, content })
        .eq("id", assetId)
        .select()
        .single();
      if (assetError) throw assetError;
      asset = data;
    } else {
      const { data, error: assetError } = await supabase
        .from("marketing_assets")
        .insert({
          campaign_id: campaignId,
          seller_id: competition.seller_id,
          channel,
          angle: angle || null,
          variant: variant || null,
          content,
          status: "ready",
        })
        .select()
        .single();
      if (assetError) throw assetError;
      asset = data;
    }

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
