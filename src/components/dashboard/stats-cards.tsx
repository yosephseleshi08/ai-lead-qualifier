"use client";

import { motion } from "framer-motion";
import { Users, Target, TrendingUp, DollarSign, Brain, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { mockStats } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";

const stats = [
  {
    label: "Total Leads",
    value: mockStats.totalLeads,
    change: "+12.5%",
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Qualified Leads",
    value: mockStats.qualifiedLeads,
    change: "+8.2%",
    icon: Target,
    color: "bg-violet-500",
    lightColor: "bg-violet-50 dark:bg-violet-900/20",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Conversion Rate",
    value: mockStats.conversionRate,
    suffix: "%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Revenue This Month",
    value: mockStats.revenueThisMonth,
    prefix: "$",
    change: "+24.3%",
    icon: DollarSign,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "AI Accuracy",
    value: mockStats.aiAccuracy,
    suffix: "%",
    change: "+1.2%",
    icon: Brain,
    color: "bg-rose-500",
    lightColor: "bg-rose-50 dark:bg-rose-900/20",
    textColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Avg Deal Size",
    value: mockStats.avgDealSize,
    prefix: "$",
    change: "+5.7%",
    icon: Zap,
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 dark:bg-cyan-900/20",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="card-hover overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.lightColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={1.5}
                  />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
