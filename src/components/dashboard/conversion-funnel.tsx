"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { conversionFunnelData } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export function ConversionFunnel() {
  const maxCount = conversionFunnelData[0].count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Lead to customer journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnelData.map((stage, index) => {
              const width = (stage.count / maxCount) * 100;
              return (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  style={{ originX: 0 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(stage.count)}
                      </span>
                      <span className="text-xs text-gray-500">{stage.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <motion.div
                      className="h-full rounded-lg flex items-center px-3"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, #3b82f6 ${100 - index * 15}%, #8b5cf6)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    >
                      {width > 30 && (
                        <span className="text-xs font-medium text-white">
                          {stage.percentage}%
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
