import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // NVIDIA NIM free tier: ~40 requests per minute
    // We batch leads to avoid rate limits
    const scoredLeads = [];
    
    for (const lead of leads.slice(0, 20)) {
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

      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-ai/deepseek-v4-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("NVIDIA NIM API error:", res.status, errorText);
        throw new Error(`NVIDIA NIM error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      
      if (!data.choices?.[0]?.message?.content) {
        console.error("Unexpected NVIDIA response:", JSON.stringify(data));
        throw new Error("Invalid response from NVIDIA NIM");
      }

      const aiResult = JSON.parse(data.choices[0].message.content);

      scoredLeads.push({
        id: Math.random().toString(36).substring(2, 15),
        ...lead,
        ...aiResult,
        scoredAt: new Date().toISOString(),
      });

      // Small delay to respect ~40 RPM rate limit
      await new Promise((r) => setTimeout(r, 1500));
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
