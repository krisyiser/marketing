import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { pageId, templates } = await req.json();
    const configPath = path.join(process.cwd(), "public-pages.json");
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ error: "Config file not found" }, { status: 404 });
    }

    const pages = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const pageIndex = pages.findIndex((p: any) => p.id === pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Update with new templates
    pages[pageIndex].templates = templates;

    fs.writeFileSync(configPath, JSON.stringify(pages, null, 2));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
