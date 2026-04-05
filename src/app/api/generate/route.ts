import { NextRequest } from "next/server";
import { google } from "googleapis";
import path from "path";

export const runtime = "nodejs"; // Need nodejs for googleapis

async function getDriveClient() {
  let auth;
  console.log("[DriveAuth] Checking environment variables...");
  if (process.env.GOOGLE_PRIVATE_KEY) {
    console.log("[DriveAuth] Found GOOGLE_PRIVATE_KEY, using Individual Vars model");
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    privateKey = privateKey.replace(/\\n/g, '\n');

    auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "socimation-manager",
        private_key: privateKey.trim(),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  } else {
    const CREDENTIALS_PATH = path.join(process.cwd(), "google-credentials.json");
    console.log("[DriveAuth] No private key in ENV, checking local file:", CREDENTIALS_PATH);
    auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }
  return google.drive({ version: "v3", auth });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, format, imageUrl, selectedId } = await req.json();
    console.log("[AI] Starting generation process for:", selectedId || imageUrl);

    let imageBase64 = "";
    const fileId = selectedId || imageUrl?.split('/').pop();

    if (fileId) {
      try {
        console.log("[AI] Fetching image from Drive:", fileId);
        const drive = await getDriveClient();
        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );
        
        const buffer = Buffer.from(response.data as ArrayBuffer);
        const mimeType = response.headers["content-type"] || "image/jpeg";
        imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
        console.log("[AI] Image fetched successfully. Length:", imageBase64.length);
      } catch (err) {
        console.error("[AI] Critical error fetching image from Drive:", err);
      }
    }

    const systemPrompt = `Eres un Curador de Contenido experto. Tu misión es analizar visualmente una imagen y SELECCIONAR el mejor copy de una lista de plantillas proporcionada.
REGLAS:
1. NO escribas nada nuevo.
2. NO modifiques el texto de la plantilla elegida.
3. Elige la plantilla que mejor se adapte a lo que se ve en la imagen.
4. Si no hay una relación clara, elige la opción más general y profesional.
5. Devuelve ÚNICAMENTE el texto de la plantilla elegida, sin explicaciones ni introducciones.`;

    console.log("[AI] Preparing OpenRouter payload...");
    const openRouterBody: any = {
      model: "nvidia/nemotron-nano-12b-v2-vl:free",
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: `${systemPrompt}\n\nLISTA DE PLANTILLAS:\n${prompt}` },
            ...(imageBase64 ? [{ 
              type: "image_url", 
              image_url: { url: imageBase64 } 
            }] : [])
          ] 
        }
      ],
      stream: true,
    };

    console.log("[AI] Calling OpenRouter API...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openRouterBody),
    });

    if (!response.ok) {
      const errorContent = await response.text();
      console.error("[AI] OpenRouter Error Response:", errorContent);
      return new Response(JSON.stringify({ error: `IA Error: ${response.status} - ${errorContent}` }), { status: response.status });
    }

    console.log("[AI] Connection established. Streaming response...");
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) return controller.close();
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const encoder = new TextEncoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(content));
              } catch (e) {
                  // Silent fail for malformed JSON chunks
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error: any) {
    console.error("[AI] Fatal Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error in AI route" }), { status: 500 });
  }
}
