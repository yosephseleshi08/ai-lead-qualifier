"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadDetailDrawer } from "@/components/leads/lead-detail-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Upload, Brain, Loader2, Download, FileSpreadsheet, Sparkles } from "lucide-react";
import { getScoreColor, getScoreBg } from "@/lib/utils";

export default function LeadsPage() {
  const [scoredLeads, setScoredLeads] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);
    setIsScoring(false);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

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
      }).filter((l) => l.name !== "Unknown" || l.email);

      if (parsed.length === 0) throw new Error("No valid leads found in CSV");

      setIsUploading(false);
      setIsScoring(true);

      const res = await fetch("/api/score-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsed.slice(0, 20) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || `Server error: ${res.status}`);
      }

      setScoredLeads(data.leads || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Check your NVIDIA API key.");
    } finally {
      setIsUploading(false);
      setIsScoring(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Score", "Category", "Reasoning", "Action"];
    const rows = scoredLeads.map((l) =>
      [
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.company}"`,
        l.score,
        l.category,
        `"${l.reasoning}"`,
        `"${l.recommendedAction}"`,
      ].join(",")
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
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white"
          >
            Leads
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1"
          >
            Manage and qualify your sales leads
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* AI Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-100 dark:border-violet-800"
      >
        <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg">
          <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            AI Auto-Scoring Active
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All new leads are automatically scored based on your ICP and historical deal patterns
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          Configure
        </Button>
      </motion.div>

      {/* Filters */}
      <LeadFilters />

      {/* REAL AI CSV Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-dashed border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-900/10 dark:to-blue-900/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Real Leads for AI Scoring</CardTitle>
                <CardDescription>
                  Upload a CSV with columns: name, email, company, source, notes. Our DeepSeek AI will score each lead 0-100.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {scoredLeads.length === 0 && !isScoring && (
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || isScoring}
                />
                <Button disabled={isUploading || isScoring}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing CSV...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </label>
            )}

            {isScoring && (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                <span className="text-sm text-violet-700 dark:text-violet-300">
                  DeepSeek AI is analyzing your leads... (~10 seconds per lead)
                </span>
              </div>
            )}

            {scoredLeads.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scored <strong>{scoredLeads.length}</strong> leads successfully
                  </p>
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Lead</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Score</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">AI Insight</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {scoredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                            <div className="text-xs text-gray-500">{lead.email}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.company}</td>
                          <td className="px-4 py-3">
                            <span className={`text-lg font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getScoreBg(lead.score)}`}>
                              {lead.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">{lead.reasoning}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{lead.recommendedAction}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setScoredLeads([])}>
                  Upload Another CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mock Data Table */}
      <LeadTable />

      {/* Detail Drawer */}
      <LeadDetailDrawer />
    </div>
  );
}
