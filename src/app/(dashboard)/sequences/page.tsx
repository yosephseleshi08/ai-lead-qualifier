"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSequences } from "@/lib/mock-data";
import { Zap, Play, Pause, Users, TrendingUp, Mail, Phone, Clock } from "lucide-react";

export default function SequencesPage() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Sequences
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 dark:text-gray-400 mt-1">
            Automated outreach and nurture campaigns
          </motion.p>
        </div>
        <Button><Zap className="w-4 h-4 mr-2" />New Sequence</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockSequences.map((seq, index) => (
          <motion.div key={seq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{seq.name}</CardTitle>
                    <CardDescription>{seq.description}</CardDescription>
                  </div>
                  <Badge variant={seq.isActive ? "success" : "secondary"}>{seq.isActive ? "Active" : "Paused"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{seq.enrolledCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{seq.conversionRate}% conversion</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {seq.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">{step.order}</div>
                      {step.type === "email" && <Mail className="w-4 h-4 text-gray-500" />}
                      {step.type === "call" && <Phone className="w-4 h-4 text-gray-500" />}
                      {step.type === "wait" && <Clock className="w-4 h-4 text-gray-500" />}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{step.type === "wait" ? `Wait ${step.delayDays} days` : step.subject}</p>
                      </div>
                      {step.delayDays > 0 && step.type !== "wait" && <span className="text-xs text-gray-500">+{step.delayDays}d</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    {seq.isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {seq.isActive ? "Pause" : "Start"}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
