import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DRAFTS_PATH = path.join(process.cwd(), "drafts.json");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");
  if (!pageId) return NextResponse.json({ error: "pageId is required" }, { status: 400 });

  try {
    if (!fs.existsSync(DRAFTS_PATH)) return NextResponse.json({ drafts: [] });
    const drafts = JSON.parse(fs.readFileSync(DRAFTS_PATH, "utf-8"));
    return NextResponse.json({ drafts: drafts.filter((d: any) => d.pageId === pageId) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pageId, drafts: newDrafts } = await req.json();
    let drafts: any[] = [];
    if (fs.existsSync(DRAFTS_PATH)) {
      drafts = JSON.parse(fs.readFileSync(DRAFTS_PATH, "utf-8"));
    }
    
    // Merge: Replace old drafts of the same page with the new ones
    const filtered = drafts.filter((d: any) => d.pageId !== pageId);
    const updated = [...filtered, ...newDrafts.map((d: any) => ({ ...d, pageId }))];
    
    fs.writeFileSync(DRAFTS_PATH, JSON.stringify(updated, null, 2));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
