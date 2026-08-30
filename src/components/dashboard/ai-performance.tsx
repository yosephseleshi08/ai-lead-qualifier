"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { aiPerformanceData } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp } from "lucide-react";

export function AIPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" />
              AI Performance
            </CardTitle>
            <CardDescription>Model accuracy over time</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            94.7%
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis domain={[85, 100]} stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">Leads Scored (7d)</p>
              <p className="text-lg font-bold text-violet-700 dark:text-violet-300">2,840</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">False Positives</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">3.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
