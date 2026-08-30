"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockTeam } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Crown } from "lucide-react";
import Image from "next/image";

export function TeamActivity() {
  const topPerformer = mockTeam.reduce((prev, curr) =>
    prev.revenueGenerated > curr.revenueGenerated ? prev : curr
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeam.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <Image src={member.avatar} alt={member.name} width={40} height={40} className="rounded-full" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      member.status === "active"
                        ? "bg-emerald-500"
                        : member.status === "away"
                        ? "bg-amber-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    {member.id === topPerformer.id && (
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{member.dealsClosed} deals • {member.conversionRate}% conv.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(member.revenueGenerated)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
