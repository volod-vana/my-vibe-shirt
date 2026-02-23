import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let _ai: GoogleGenAI | null = null;
function getAI() {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return _ai;
}

export async function POST(request: Request) {
  try {
    const { instagram, spotify } = await request.json();

    // ---------- Step 1: Gemini 2.5 builds a t-shirt design prompt ----------

    const analysisPrompt = `You are a creative director designing a unique t-shirt.

You have two data sources about a person:

**Instagram data:**
${JSON.stringify(instagram, null, 2)}

**Spotify data:**
${JSON.stringify(spotify, null, 2)}

Based on their Instagram aesthetic (colors, themes, subjects in their posts) and Spotify taste (genres, artists, mood of their top tracks), write a single, detailed image-generation prompt for a t-shirt graphic design.

Rules:
- The design should be a flat, bold illustration suitable for screen printing
- Use a limited color palette (3-5 colors) inspired by their Instagram aesthetic
- Incorporate visual motifs from their music taste (genre symbols, mood, energy)
- The design must be on a pure white background, centered, with clean edges
- Do NOT include any text on the design
- Describe the style explicitly (e.g. "flat vector art", "retro screen-print", "minimalist line art")
- Keep the prompt under 200 words

Return ONLY the image generation prompt, nothing else.`;

    const ai = getAI();
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
    });

    const imagePrompt =
      analysisResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!imagePrompt) {
      return NextResponse.json(
        { error: "Failed to generate design prompt" },
        { status: 500 },
      );
    }

    // ---------- Step 2: nano-banana generates the image ----------

    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-image-generation",
      contents: imagePrompt,
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    let imageBase64: string | null = null;
    let mimeType = "image/png";

    for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data ?? null;
        mimeType = part.inlineData.mimeType ?? "image/png";
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      image: `data:${mimeType};base64,${imageBase64}`,
      prompt: imagePrompt,
    });
  } catch (err) {
    console.error("[generate]", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
