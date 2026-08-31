"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getScoreColor, getScoreBg, formatNumber } from "@/lib/utils";
import {
  Upload,
  Brain,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Download,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const parsed = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i]?.trim() || "";
      });
      return {
        name: obj.name || obj.full_name || "Unknown",
        email: obj.email || "",
        company: obj.company || obj.organization || "",
        source: obj.source || obj.lead_source || "Import",
        notes: obj.notes || obj.message || "",
      };
    });

    setIsUploading(false);
    setIsScoring(true);

    // Call your FREE DeepSeek API
    const res = await fetch("/api/score-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads: parsed.slice(0, 20) }), // Score first 20 for speed
    });

    const data = await res.json();
    setLeads(data.leads || []);
    setIsScoring(false);
  };

  const hotLeads = leads.filter((l) => l.category === "Hot");
  const warmLeads = leads.filter((l) => l.category === "Warm");
  const avgScore = leads.length
    ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length)
    : 0;

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Score", "Category", "Reasoning", "Action"];
    const rows = leads.map((l) =>
      [l.name, l.email, l.company, l.score, l.category, l.reasoning, l.recommendedAction].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scored-leads.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">AI-powered lead qualification</p>
          </div>
          <div className="flex gap-3">
            {leads.length > 0 && (
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {leads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard icon={Users} label="Total Leads" value={leads.length} />
            <StatCard icon={TrendingUp} label="Avg Score" value={`${avgScore}/100`} />
            <StatCard icon={ArrowUpRight} label="Hot Leads" value={hotLeads.length} color="text-emerald-500" />
            <StatCard icon={ArrowDownRight} label="Warm Leads" value={warmLeads.length} color="text-amber-500" />
          </motion.div>
        )}

        {/* Upload */}
        {leads.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center bg-white dark:bg-gray-900"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Your Leads
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Upload a CSV with columns: name, email, company, source, notes. Our AI will score each lead in seconds.
            </p>
            <label className="cursor-pointer">
              <Input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || isScoring}
              />
              <Button size="lg" disabled={isUploading || isScoring}>
                {isScoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI Scoring {isUploading ? "Parsing..." : `${leads.length} leads...`}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Parsing CSV..." : "Upload CSV"}
                  </>
                )}
              </Button>
            </label>
          </motion.div>
        )}

        {/* Scoring Loader */}
        {isScoring && leads.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
              <Brain className="w-5 h-5 text-violet-600 animate-pulse" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                DeepSeek-V4 is analyzing your leads...
              </span>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {leads.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Lead</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Company</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">AI Insight</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{lead.company}</td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBg(lead.score)}`}>
                          {lead.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">{lead.reasoning}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{lead.recommendedAction}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color || "text-gray-500"}`} />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
