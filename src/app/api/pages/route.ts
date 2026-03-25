import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "pages.config.json");
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ pages: [] });
    }
    const fileContent = fs.readFileSync(configPath, "utf-8");
    const pages = JSON.parse(fileContent);
    
    // Remove access tokens from the public list for security, 
    // we'll fetch them on the server side when publishing.
    const safePages = pages.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      brandManual: p.brandManual || "",
      rules: p.rules || "",
      context: p.context || "",
      driveFolderId: p.driveFolderId
    }));

    return NextResponse.json({ pages: safePages });
  } catch (error) {
    console.error("Error reading pages config:", error);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}
