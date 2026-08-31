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

    // Score each lead with DeepSeek-V4-Flash (FREE, UNLIMITED)
    const scoredLeads = await Promise.all(
      leads.map(async (lead: any) => {
        const prompt = `You are a lead qualification expert. Analyze this lead and respond ONLY in valid JSON:

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

        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-v4-flash-0731",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 300,
          }),
        });

        const data = await res.json();
        const aiResult = JSON.parse(data.choices[0].message.content);

        return {
          id: Math.random().toString(36).substring(2, 15),
          ...lead,
          ...aiResult,
          scoredAt: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ leads: scoredLeads });
  } catch (error) {
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
