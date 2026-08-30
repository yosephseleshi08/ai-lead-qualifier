"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockLeads } from "@/lib/mock-data";
import { getScoreColor, getScoreBg, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, Brain } from "lucide-react";
import Link from "next/link";

export function RecentLeads() {
  const recent = mockLeads.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent High-Value Leads</CardTitle>
            <CardDescription>Leads scored by AI in the last 7 days</CardDescription>
          </div>
          <Link
            href="/leads"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getScoreBg(lead.score)}`}>
                    {lead.score}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    {lead.aiInsights && (
                      <Brain className="w-3.5 h-3.5 text-violet-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {lead.title} at {lead.company}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(lead.estimatedValue)}
                  </p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(lead.createdAt)}</p>
                </div>
                <Badge variant={lead.status === "closed_won" ? "success" : "default"} className="hidden sm:inline-flex capitalize">
                  {lead.status.replace("_", " ")}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
