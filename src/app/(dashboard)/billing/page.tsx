"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTenant } from "@/lib/mock-data";
import { CreditCard, Check, Zap } from "lucide-react";

const plans = [
  { name: "Starter", price: "$299", period: "/month", description: "For small teams", features: ["Up to 1,000 leads", "Basic AI scoring", "Email sequences", "2 team members"], current: mockTenant.plan === "starter" },
  { name: "Growth", price: "$799", period: "/month", description: "For growing teams", features: ["Up to 10,000 leads", "Advanced AI insights", "White-label", "API access", "10 team members"], current: mockTenant.plan === "growth", popular: true },
  { name: "Enterprise", price: "Custom", period: "", description: "For large orgs", features: ["Unlimited leads", "Custom AI models", "SSO & SAML", "Dedicated support", "SLA guarantee"], current: mockTenant.plan === "enterprise" },
];

export default function BillingPage() {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Billing</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 dark:text-gray-400 mt-1">Manage your subscription and usage</motion.p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{mockTenant.plan}</p>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
            <Card className={`relative h-full ${plan.popular ? "border-violet-300 dark:border-violet-700 shadow-lg" : ""}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-violet-600 text-white">Most Popular</Badge></div>}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-emerald-500" />{feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
