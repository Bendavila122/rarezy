// Supabase Edge Function: polled by the client while a marketing image is
// "generating". Checks the AtlasCloud job once; if complete, downloads the
// (24h-expiring) signed image and re-uploads it into Supabase Storage so
// the marketing_assets row ends up with a permanent URL, then marks the
// asset ready.
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

    const { assetId } = await req.json();
    if (!assetId) throw new Error("Missing assetId");

    const { data: asset, error: assetError } = await supabase
      .from("marketing_assets")
      .select("*, sellers(owner_id)")
      .eq("id", assetId)
      .single();
    if (assetError || !asset) throw new Error("Asset not found");
    if (asset.sellers.owner_id !== user.id) throw new Error("Not authorised");

    if (asset.status !== "generating") {
      return new Response(JSON.stringify({ ok: true, asset }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const pollRes = await fetch(`https://api.atlascloud.ai/api/v1/model/prediction/${asset.provider_job_id}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("ATLASCLOUD_API_KEY")}` },
    });
    if (!pollRes.ok) throw new Error(`AtlasCloud poll error: ${await pollRes.text()}`);
    const pollData = (await pollRes.json()).data;

    if (pollData.status === "failed") {
      const { data: updated } = await supabase
        .from("marketing_assets")
        .update({ status: "failed" })
        .eq("id", assetId)
        .select()
        .single();
      return new Response(JSON.stringify({ ok: true, asset: updated }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (pollData.status !== "completed" && pollData.status !== "succeeded") {
      return new Response(JSON.stringify({ ok: true, asset }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const imageUrl = pollData.outputs[0];
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Couldn't download generated image");
    const imageBytes = new Uint8Array(await imageRes.arrayBuffer());

    const path = `${asset.seller_id}/${asset.id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("marketing-assets")
      .upload(path, imageBytes, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from("marketing-assets").getPublicUrl(path);

    const { data: updated, error: updateError } = await supabase
      .from("marketing_assets")
      .update({ status: "ready", image_url: publicUrl.publicUrl })
      .eq("id", assetId)
      .select()
      .single();
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ ok: true, asset: updated }), {
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
