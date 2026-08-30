"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PipelineColumn } from "@/types";
import { KanbanCard } from "./kanban-card";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: PipelineColumn;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="w-80 shrink-0 flex flex-col max-h-[calc(100vh-200px)]"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {column.leads.length}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatCurrency(column.totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <SortableContext
          items={column.leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {column.leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-xs text-gray-400">Drop leads here</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button className="mt-3 flex items-center gap-2 p-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Plus className="w-4 h-4" />
        Add lead
      </button>
    </div>
  );
}
