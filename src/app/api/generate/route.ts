import { NextRequest } from "next/server";
import { google } from "googleapis";
import path from "path";

export const runtime = "nodejs"; // Need nodejs for googleapis

const CREDENTIALS_PATH = path.join(process.cwd(), "google-credentials.json");

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, format, imageUrl, selectedId } = await req.json();

    let imageBase64 = "";

    // 1. If we have a file ID, fetch the image from Drive locally
    // This solves the "localhost" access error from OpenRouter
    const fileId = selectedId || imageUrl?.split('/').pop();

    if (fileId) {
      try {
        const drive = await getDriveClient();
        const response = await drive.files.get(
          { fileId: fileId, alt: "media" },
          { responseType: "arraybuffer" }
        );
        
        const buffer = Buffer.from(response.data as ArrayBuffer);
        const mimeType = response.headers["content-type"] || "image/jpeg";
        imageBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } catch (err) {
        console.error("Error fetching image for AI Vision:", err);
      }
    }

    const systemPrompt = `Eres un Director Creativo y Community Manager experto en redes sociales en México.
Tu tarea es escribir el copy perfecto para redes sociales después de analizar visualmente la imagen y la identidad de marca proporcionada.
REGLAS CRÍTICAS:
1. Idioma: Español de México, cercano y profesional.
2. Estructura: Gancho impactante (Hook) + Cuerpo del post + Llamada a la acción (CTA) + Hashtags.
3. Veracidad: No inventes promociones o datos que no veas en la imagen o en la identidad de marca. Si la imagen tiene texto (direcciones, precios), úsalos para dar precisión.
4. Tono: Sigue ESTRICTAMENTE la identidad de marca que se te proporciona.
5. NO uses títulos (ej. "Copy:"), NO uses comillas, NO des explicaciones. Solo el texto final.`;

    const openRouterBody: any = {
      model: "nvidia/nemotron-nano-12b-v2-vl:free",
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: `${systemPrompt}\n\n${prompt}` },
            ...(imageBase64 ? [{ 
              type: "image_url", 
              image_url: { 
                url: imageBase64 // This is now a Base64 string!
              } 
            }] : [])
          ] 
        }
      ],
      stream: true,
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openRouterBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
    }

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
              const dataStr = trimmed.slice(6);
              if (dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(content));
              } catch (_) {}
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
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
