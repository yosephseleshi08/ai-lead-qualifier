"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  Brain,
  Send,
  Sparkles,
  User,
  Bot,
  Zap,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Lightbulb,
  Loader2,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "email" | "insight" | "recommendation" | "forecast";
  metadata?: any;
  timestamp: Date;
}

const quickActions = [
  { label: "Score my top leads", icon: Zap, prompt: "Analyze my top 5 leads and tell me which ones to prioritize today" },
  { label: "Draft outreach email", icon: Mail, prompt: "Write a personalized email for Sarah Chen at TechFlow" },
  { label: "Revenue forecast", icon: TrendingUp, prompt: "What's my predicted revenue for next quarter based on current pipeline?" },
  { label: "At-risk deals", icon: AlertTriangle, prompt: "Which deals in my pipeline are at risk of falling through?" },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm your AI Sales Copilot. I can help you prioritize leads, draft emails, forecast revenue, and identify at-risk deals. What would you like to work on?",
    type: "text",
    timestamp: new Date(),
  },
];

// Simulated AI responses based on prompts
function generateAIResponse(prompt: string): { content: string; type: Message["type"]; metadata?: any } {
  const lower = prompt.toLowerCase();

  if (lower.includes("top") || lower.includes("prioritize") || lower.includes("score")) {
    const top = mockLeads.filter(l => l.aiInsights).sort((a, b) => (b.aiInsights?.score || 0) - (a.aiInsights?.score || 0)).slice(0, 3);
    return {
      type: "insight",
      content: `Here are your top 3 priority leads for today:`,
      metadata: { leads: top },
    };
  }

  if (lower.includes("email") || lower.includes("draft") || lower.includes("outreach")) {
    return {
      type: "email",
      content: `Subject: Quick question about TechFlow's growth

Hi Sarah,

I noticed TechFlow recently raised a Series B — congratulations! 🎉

I work with fast-growing SaaS companies like yours to streamline lead qualification and help sales teams focus on the highest-value opportunities.

Given your engineering team's scale, I'd love to show you how our AI can reduce your sales cycle by 30% and surface the leads most likely to convert.

Would you be open to a 15-minute demo this week?

Best,
Alex`,
    };
  }

  if (lower.includes("forecast") || lower.includes("revenue") || lower.includes("predict")) {
    return {
      type: "forecast",
      content: `Based on your current pipeline analysis:

**Q3 Revenue Forecast: $1.24M**

• Qualified leads: 634 (22.3% conversion rate)
• Weighted pipeline value: $1.24M
• Confidence: 87%
• Risk-adjusted: $1.08M

**Key drivers:**
• 3 enterprise deals ($200K+) in negotiation
• AI accuracy at 94.7% — high confidence
• Average deal velocity improved 18% vs last quarter`,
      metadata: { forecast: 1240000, confidence: 87 },
    };
  }

  if (lower.includes("risk") || lower.includes("at-risk") || lower.includes("fall")) {
    return {
      type: "recommendation",
      content: `⚠️ **3 deals flagged as at-risk:**

1. **Jennifer Walsh - RetailGiant**
   • Risk: High (72%)
   • Reason: No response in 5 days, evaluating competitors
   • Action: Send competitive comparison + case study

2. **David Kim - StartupXYZ**
   • Risk: Medium (58%)
   • Reason: Price sensitivity, limited budget
   • Action: Offer startup discount + ROI calculator

3. **Elena Rodriguez - MedSync**
   • Risk: Low (23%)
   • Reason: Long procurement cycle, but strong engagement
   • Action: Schedule security review call`,
    };
  }

  if (lower.includes("competitor") || lower.includes("competition")) {
    return {
      type: "insight",
      content: `**Competitive Intelligence Report:**

Based on lead conversations and web signals:

• **HubSpot** - Mentioned by 34% of prospects (most common alternative)
• **Salesforce Einstein** - 18% mention (enterprise focus)
• **Apollo.io** - 12% mention (data enrichment)
• **ZoomInfo** - 9% mention (contact data)

**Your advantages:**
✅ AI scoring accuracy (94.7% vs industry avg 72%)
✅ White-label capability (unique)
✅ Lead decay + re-engagement (unique)
✅ 40% faster implementation

**Recommended messaging:** Lead with AI accuracy + white-label for agencies.`,
    };
  }

  return {
    type: "text",
    content: `I analyzed your request. Based on your current pipeline of 2,847 leads with a 22.3% conversion rate, here are my recommendations:

1. **Focus on the 94+ scored leads first** — they have 87% conversion probability
2. **Re-engage stale leads** — 23 leads haven't had activity in 14+ days
3. **Optimize outreach timing** — Tuesday-Thursday, 9-11 AM shows 34% better response

Would you like me to draft specific emails or dive deeper into any of these?`,
  };
}

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (prompt?: string) => {
    const text = prompt || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        type: response.type,
        metadata: response.metadata,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
            <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Sales Copilot</h1>
            <p className="text-xs text-gray-500">GPT-4 powered sales intelligence</p>
          </div>
        </div>
        <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-900/30">
          <Sparkles className="w-3 h-3 mr-1" /> Online
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                <Card className={`${message.role === "user" ? "bg-blue-600 text-white border-0" : "bg-white dark:bg-gray-900"}`}>
                  <CardContent className="p-3">
                    {/* Render different message types */}
                    {message.type === "email" ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-[10px]">
                            <Mail className="w-3 h-3 mr-1" /> Generated Email
                          </Badge>
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                          >
                            {copiedId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedId === message.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                          {message.content}
                        </pre>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Mail className="w-3 h-3 mr-1" /> Send via Email
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                          </Button>
                        </div>
                      </div>
                    ) : message.type === "insight" && message.metadata?.leads ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{message.content}</p>
                        {message.metadata.leads.map((lead: any) => (
                          <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              lead.score >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {lead.score}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</p>
                              <p className="text-xs text-gray-500">{lead.company} • {lead.aiInsights?.conversionProbability && `${Math.round(lead.aiInsights.conversionProbability * 100)}% conv.`}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(lead.estimatedValue)}</span>
                          </div>
                        ))}
                      </div>
                    ) : message.type === "forecast" ? (
                      <div>
                        <p className="text-sm whitespace-pre-line text-gray-800 dark:text-gray-200">{message.content}</p>
                        {message.metadata && (
                          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              Confidence Score: {message.metadata.confidence}%
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-white dark:bg-gray-900">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-sm text-gray-500">Analyzing your data...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length < 3 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors text-left"
            >
              <action.icon className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4">
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <Lightbulb className="w-5 h-5 text-gray-400 ml-2" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about your leads, pipeline, or deals..."
            className="border-0 bg-transparent focus-visible:ring-0 text-sm"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI Copilot can make mistakes. Always review before sending.
        </p>
      </div>
    </div>
  );
}
