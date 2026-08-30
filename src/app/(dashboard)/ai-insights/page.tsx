"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Gauge } from "@/components/ui/gauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockLeads } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  MessageSquare,
  BarChart3,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

const topLeads = mockLeads.filter((l) => l.aiInsights).sort((a, b) => (b.aiInsights?.score || 0) - (a.aiInsights?.score || 0));

const icpRadarData = [
  { subject: "Company Size", A: 85, fullMark: 100 },
  { subject: "Budget Match", A: 92, fullMark: 100 },
  { subject: "Industry Fit", A: 78, fullMark: 100 },
  { subject: "Engagement", A: 88, fullMark: 100 },
  { subject: "Decision Power", A: 95, fullMark: 100 },
  { subject: "Urgency", A: 70, fullMark: 100 },
];

const scoreDistribution = [
  { range: "90-100", count: 12, label: "Hot" },
  { range: "80-89", count: 28, label: "Warm" },
  { range: "70-79", count: 45, label: "Qualified" },
  { range: "60-69", count: 67, label: "Potential" },
  { range: "50-59", count: 89, label: "Nurture" },
  { range: "0-49", count: 156, label: "Cold" },
];

export default function AIInsightsPage() {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              AI Insights
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1 ml-[52px]"
          >
            AI-powered lead intelligence and recommendations
          </motion.p>
        </div>
        <Button variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Retrain Model
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AI Accuracy", value: "94.7%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Leads Scored Today", value: "42", icon: Brain, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Avg Response Time", value: "2.3h", icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Predicted Revenue", value: "$1.2M", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`p-4 rounded-2xl ${stat.bg} border border-gray-200 dark:border-gray-800`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Score Distribution
            </CardTitle>
            <CardDescription>How your leads are distributed by AI score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="range" type="category" stroke="#9ca3af" fontSize={12} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-500" />
              ICP Match Analysis
            </CardTitle>
            <CardDescription>How well current leads match your ideal customer profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={icpRadarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Radar name="Current Leads" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Top AI-Prioritized Leads
          </CardTitle>
          <CardDescription>Leads with highest conversion probability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLeads.slice(0, 5).map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Gauge value={lead.aiInsights!.score} size={70} strokeWidth={8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {lead.firstName} {lead.lastName}
                    </h4>
                    <Badge variant={lead.aiInsights!.score >= 80 ? "success" : "warning"} className="text-[10px]">
                      {lead.aiInsights!.score >= 80 ? "Hot Lead" : "Warm"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {lead.title} at {lead.company} • {lead.industry}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                    {lead.aiInsights!.recommendedAction}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(lead.aiInsights!.estimatedValue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(lead.aiInsights!.conversionProbability * 100)}% conv.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  View <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Engagement Optimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  AI detected that leads contacted between 9-11 AM have 34% higher response rates.
                </p>
                <Button size="sm" variant="outline">Apply Recommendation</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">At-Risk Leads Detected</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  23 leads haven't had activity in 14+ days. AI suggests re-engagement sequences.
                </p>
                <Button size="sm" variant="outline">View At-Risk Leads</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
