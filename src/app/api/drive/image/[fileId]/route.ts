import { NextRequest } from "next/server";
import { google } from "googleapis";
import path from "path";

export const runtime = "nodejs";

const CREDENTIALS_PATH = path.join(process.cwd(), "google-credentials.json");

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) return new Response("Missing File ID", { status: 400 });

  console.log(`[ImageProxy] Fetching file: ${fileId}`);

  try {
    const drive = await getDriveClient();
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    return new Response(buffer, {
      headers: {
        "Content-Type": response.headers["content-type"] || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image Proxy Error:", error);
    return new Response("Error fetching image", { status: 500 });
  }
}
