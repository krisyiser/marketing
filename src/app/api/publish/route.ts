import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { pageId, platform, message, imageUrl } = await req.json();

    // 1. Find the page config to get the token
    const configPath = path.join(process.cwd(), "pages.config.json");
    const pages = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const page = pages.find((p: any) => p.id === pageId);

    if (!page) {
      return NextResponse.json({ error: "Page not found in config" }, { status: 404 });
    }

    const accessToken = page.accessToken;
    let endpoint = "";
    let body: any = {};

    if (platform === "Facebook") {
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body = {
        url: imageUrl,
        message: message,
        access_token: accessToken,
      };
    } else if (platform === "Instagram") {
      if (!page.instagramAccountId) {
        return NextResponse.json({ error: "No Instagram account linked to this page" }, { status: 400 });
      }
      // Instagram is a 2-step process: Create container -> Publish container
      // For MVP simplicity, we might need a more robust approach, but let's try the direct post if possible
      // or implement the 2 steps.
      return NextResponse.json({ error: "Instagram publishing integration in progress..." }, { status: 501 });
    }

    const fbResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await fbResponse.json();

    if (!fbResponse.ok) {
      return NextResponse.json({ error: "Facebook API error", details: result }, { status: fbResponse.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Publishing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
