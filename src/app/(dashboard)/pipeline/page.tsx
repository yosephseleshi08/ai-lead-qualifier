"use client";

import { motion } from "framer-motion";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { DollarSign, Users } from "lucide-react";
import { mockPipelineColumns } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function PipelinePage() {
  const totalPipeline = mockPipelineColumns.reduce((sum, col) => sum + col.totalValue, 0);
  const totalLeads = mockPipelineColumns.reduce((sum, col) => sum + col.leads.length, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white"
          >
            Sales Pipeline
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1"
          >
            Drag and drop leads to update their status
          </motion.p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{totalLeads} leads</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">{formatCurrency(totalPipeline)} pipeline</span>
          </div>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
}
