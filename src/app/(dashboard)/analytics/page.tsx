"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { revenueData, mockTeam } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { BarChart3, Users, Target } from "lucide-react";

const sourceData = [
  { name: "Organic", value: 35, color: "#3b82f6" },
  { name: "LinkedIn", value: 25, color: "#8b5cf6" },
  { name: "Referral", value: 20, color: "#10b981" },
  { name: "Outbound", value: 12, color: "#f59e0b" },
  { name: "Conference", value: 8, color: "#ef4444" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 dark:text-gray-400 mt-1">
          Deep-dive into your sales performance
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Revenue by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-500" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {sourceData.map((source) => (
                <div key={source.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{source.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Leads</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Deals</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {mockTeam.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.role}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{member.leadsAssigned}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{member.dealsClosed}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{formatCurrency(member.revenueGenerated)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-medium ${member.conversionRate >= 15 ? "text-emerald-600" : "text-amber-600"}`}>
                        {member.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
