"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Brain, AlertCircle } from "lucide-react";

const forecasts = [
  { quarter: "Q3 2024", amount: 1240000, confidence: 87, trend: "up", change: 24 },
  { quarter: "Q4 2024", amount: 1580000, confidence: 72, trend: "up", change: 27 },
  { quarter: "Q1 2025", amount: 1420000, confidence: 58, trend: "down", change: -10 },
];

export function RevenueForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" />
              AI Revenue Forecast
            </CardTitle>
            <CardDescription>Predicted revenue based on pipeline analysis</CardDescription>
          </div>
          <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            87% Confidence
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts.map((forecast) => (
              <div key={forecast.quarter} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{forecast.quarter}</span>
                    <div className="flex items-center gap-1">
                      {forecast.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                      {forecast.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {forecast.trend === "flat" && <Minus className="w-4 h-4 text-gray-500" />}
                      <span className={`text-xs font-medium ${
                        forecast.trend === "up" ? "text-emerald-600" : forecast.trend === "down" ? "text-red-600" : "text-gray-600"
                      }`}>
                        {forecast.change > 0 ? "+" : ""}{forecast.change}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(forecast.amount)}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                        style={{ width: `${forecast.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{forecast.confidence}% conf.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Q1 2025 forecast shows decline due to seasonal patterns. Consider increasing Q4 outreach by 15%.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
