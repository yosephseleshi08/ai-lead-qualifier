"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Shield, ArrowRight, Mail, Phone } from "lucide-react";

const riskAlerts = [
  {
    id: "risk_1",
    lead: "Jennifer Walsh",
    company: "RetailGiant Corp",
    value: 220000,
    risk: 72,
    reason: "No response in 5 days, evaluating competitors",
    action: "Send competitive comparison + case study",
    severity: "high" as const,
  },
  {
    id: "risk_2",
    lead: "David Kim",
    company: "StartupXYZ",
    value: 6000,
    risk: 58,
    reason: "Price sensitivity, limited budget",
    action: "Offer startup discount + ROI calculator",
    severity: "medium" as const,
  },
  {
    id: "risk_3",
    lead: "Elena Rodriguez",
    company: "MedSync Health",
    value: 125000,
    risk: 23,
    reason: "Long procurement cycle, but strong engagement",
    action: "Schedule security review call",
    severity: "low" as const,
  },
];

export function DealRiskAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-red-100 dark:border-red-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Deal Risk Alerts
            </CardTitle>
            <CardDescription>AI-detected deals that need attention</CardDescription>
          </div>
          <Badge variant="destructive" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            3 At Risk
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`p-3 rounded-xl border ${
                  alert.severity === "high"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                    : alert.severity === "medium"
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.lead}</p>
                      <Badge
                        variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "warning" : "default"}
                        className="text-[10px]"
                      >
                        {alert.risk}% Risk
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{alert.company} • {formatCurrency(alert.value)}</p>
                  </div>
                  <Shield className={`w-5 h-5 ${
                    alert.severity === "high" ? "text-red-500" : alert.severity === "medium" ? "text-amber-500" : "text-blue-500"
                  }`} />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{alert.reason}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Suggested: {alert.action}
                  </p>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="w-7 h-7">
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-7 h-7">
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 text-sm">
            View All Risk Analysis <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
