"use client";

import { motion } from "framer-motion";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { AIPerformance } from "@/components/dashboard/ai-performance";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { TeamActivity } from "@/components/dashboard/team-activity";
import { RevenueForecast } from "@/components/dashboard/revenue-forecast";
import { DealRiskAlerts } from "@/components/dashboard/deal-risk-alerts";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1"
          >
            Welcome back, Alex. Here's what's happening with your leads.
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              AI scored 42 leads today
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </motion.div>
          <Link href="/ai-copilot">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-100 dark:border-violet-800 cursor-pointer hover:shadow-md transition-shadow"
            >
              <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-800 dark:text-violet-300">
                AI Copilot
              </span>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <ConversionFunnel />
        </div>
      </div>

      {/* AI Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueForecast />
        <DealRiskAlerts />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads />
        <div className="space-y-6">
          <AIPerformance />
          <TeamActivity />
        </div>
      </div>
    </div>
  );
}
