"use client";

import { motion } from "framer-motion";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadDetailDrawer } from "@/components/leads/lead-detail-drawer";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Brain } from "lucide-react";

export default function LeadsPage() {
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
            Leads
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-1"
          >
            Manage and qualify your sales leads
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* AI Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-100 dark:border-violet-800"
      >
        <div className="p-2 bg-violet-100 dark:bg-violet-800 rounded-lg">
          <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            AI Auto-Scoring Active
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All new leads are automatically scored based on your ICP and historical deal patterns
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          Configure
        </Button>
      </motion.div>

      {/* Filters */}
      <LeadFilters />

      {/* Table */}
      <LeadTable />

      {/* Detail Drawer */}
      <LeadDetailDrawer />
    </div>
  );
}
