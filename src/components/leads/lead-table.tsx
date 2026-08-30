"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { getScoreBg, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Brain, Mail, Phone, MoreHorizontal, ArrowUpDown } from "lucide-react";

export function LeadTable() {
  const { leads, searchQuery, statusFilter, setSelectedLead, setLeadDetailOpen } = useAppStore();

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1 cursor-pointer">
                  Lead <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Value
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Last Activity
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((lead, index) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedLead(lead);
                  setLeadDetailOpen(true);
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.firstName} {lead.lastName}
                        </p>
                        {lead.aiInsights && (
                          <Brain className="w-3.5 h-3.5 text-violet-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{lead.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 dark:text-white">{lead.company}</p>
                  <p className="text-xs text-gray-500">{lead.industry}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreBg(lead.score)}`}>
                      {lead.score}
                    </div>
                    {lead.aiInsights && (
                      <span className="text-xs text-gray-500">
                        {Math.round(lead.aiInsights.conversionProbability * 100)}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(lead.estimatedValue)}
                  </p>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <Badge variant={lead.status === "closed_won" ? "success" : lead.status === "new" ? "secondary" : "default"} className="capitalize">
                    {lead.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <p className="text-xs text-gray-500">{formatRelativeTime(lead.lastActivityAt)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No leads found matching your criteria</p>
        </div>
      )}
    </motion.div>
  );
}
