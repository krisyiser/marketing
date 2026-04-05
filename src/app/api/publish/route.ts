import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { pageId, platform, message, imageUrl } = await req.json();

    // 1. Load public metadata
    const publicPath = path.join(process.cwd(), "public-pages.json");
    if (!fs.existsSync(publicPath)) {
      return NextResponse.json({ error: "Public configuration not found" }, { status: 500 });
    }
    const pages = JSON.parse(fs.readFileSync(publicPath, "utf-8"));
    const page = pages.find((p: any) => p.id === pageId);

    if (!page) {
      return NextResponse.json({ error: "Page not found in public config" }, { status: 404 });
    }

    // 2. Load token from ENV
    console.log(`[Publish] Processing request for Page: ${pageId} on ${platform}`);
    const tokens = JSON.parse(process.env.FB_TOKENS || "{}");
    const accessToken = tokens[pageId];

    if (!accessToken) {
       console.error(`[Publish] Missing token for ${pageId}`);
       return NextResponse.json({ error: "Missing access token for this page" }, { status: 401 });
    }

    let endpoint = "";
    let body: any = {};

    // Ensure the image URL is absolute for Facebook
    const finalImageUrl = imageUrl.includes('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://socimation.gavalab.com'}${imageUrl}`;
    console.log(`[Publish] Final Image URL for FB: ${finalImageUrl}`);

    if (platform === "Facebook") {
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body = {
        url: finalImageUrl,
        message: message,
        access_token: accessToken,
      };
    } else if (platform === "Instagram") {
      // Logic...
    }

    console.log(`[Publish] Sending to Meta Endpoint: ${endpoint}`);
    const fbResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error("[Publish] Meta API Error Details:", JSON.stringify(result, null, 2));
      return NextResponse.json({ 
        error: "Facebook API error", 
        message: result.error?.message || "Unknown Meta Error",
        code: result.error?.code,
        details: result 
      }, { status: fbResponse.status });
    }

    console.log("[Publish] Success! Post ID:", result.id);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[Publish] Fatal Crash:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
