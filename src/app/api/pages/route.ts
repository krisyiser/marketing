import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), "public-pages.json");
    let pages = [];

    if (fs.existsSync(publicPath)) {
      const fileContent = fs.readFileSync(publicPath, "utf-8");
      pages = JSON.parse(fileContent);
    } else if (process.env.PUBLIC_PAGES) {
      pages = JSON.parse(process.env.PUBLIC_PAGES);
    }

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error reading public pages config:", error);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}
