import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";

const CREDENTIALS_PATH = path.join(process.cwd(), "google-credentials.json");

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) return NextResponse.json({ error: "Missing folderId" }, { status: 400 });

  try {
    const drive = await getDriveClient();

    // 1. List files in the current folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, thumbnailLink)",
      orderBy: "folder,name",
    });

    const items = res.data.files || [];
    const folders = items.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    
    // Check if we have "post" or "historias" subfolders
    const postFolder = folders.find(f => f.name?.toLowerCase().includes('post'));
    const storyFolder = folders.find(f => f.name?.toLowerCase().includes('historia'));

    let posts: any[] = [];
    let stories: any[] = [];

    // If subfolders exist, fetch their contents automatically
    if (postFolder) {
      const postRes = await drive.files.list({
        q: `'${postFolder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: "files(id, name, mimeType, thumbnailLink)",
      });
      posts = postRes.data.files || [];
    }

    if (storyFolder) {
      const storyRes = await drive.files.list({
        q: `'${storyFolder.id}' in parents and mimeType contains 'image/' and trashed = false`,
        fields: "files(id, name, mimeType, thumbnailLink)",
      });
      stories = storyRes.data.files || [];
    }

    // Generic images if no subfolders or additional ones
    const genericImages = items.filter(f => f.mimeType?.startsWith('image/') && 
      !posts.find(p => p.id === f.id) && !stories.find(s => s.id === f.id));

    return NextResponse.json({
      folders,
      posts,
      stories,
      genericImages,
      hasSmartFolders: !!(postFolder || storyFolder)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
