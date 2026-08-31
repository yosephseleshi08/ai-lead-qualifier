import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper: sleep with retry backoff
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callNVIDIA(prompt: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k3",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (res.status === 429) {
      const backoff = attempt * 3000; // 3s, 6s, 9s
      console.log(`NVIDIA 429 — retrying in ${backoff}ms (attempt ${attempt}/${retries})`);
      await sleep(backoff);
      continue;
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`NVIDIA NIM error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from NVIDIA NIM");
    }
    return data;
  }
  throw new Error("NVIDIA NIM rate limit exceeded after retries");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leads } = await req.json();

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: NVIDIA_API_KEY missing" },
        { status: 500 }
      );
    }

    const scoredLeads = [];
    
    for (const lead of leads.slice(0, 10)) { // Max 10 leads to avoid timeouts
      const prompt = `You are a lead qualification expert. Analyze this lead and respond ONLY in valid JSON format.

Lead:
- Name: ${lead.name || "Unknown"}
- Email: ${lead.email || "Unknown"}
- Company: ${lead.company || "Unknown"}
- Source: ${lead.source || "Unknown"}
- Notes: ${lead.notes || "None"}

Respond in this exact JSON format:
{
  "score": number (0-100),
  "category": "Hot" | "Warm" | "Cold",
  "reasoning": "one sentence",
  "recommendedAction": "Call today" | "Send email" | "Nurture",
  "confidence": number (0-100)
}`;

      const data = await callNVIDIA(prompt, 3);
      const aiResult = JSON.parse(data.choices[0].message.content);

      scoredLeads.push({
        id: Math.random().toString(36).substring(2, 15),
        ...lead,
        score: aiResult.score ?? 50,
        category: aiResult.category ?? "Warm",
        reasoning: aiResult.reasoning ?? "No insight available",
        recommendedAction: aiResult.recommendedAction ?? "Follow up",
        confidence: aiResult.confidence ?? 50,
        scoredAt: new Date().toISOString(),
      });

      // 3 second delay = 20 RPM (well under the 40 RPM free tier limit)
      await sleep(3000);
    }

    return NextResponse.json({ leads: scoredLeads });
  } catch (error: any) {
    console.error("SCORE-LEADS ERROR:", error);
    return NextResponse.json(
      { error: "Scoring failed", details: error.message },
      { status: 500 }
    );
  }
}
