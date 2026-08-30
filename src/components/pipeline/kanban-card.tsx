"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import { formatCurrency, getScoreBg } from "@/lib/utils";
import { Brain, GripVertical, Mail, Phone } from "lucide-react";

interface KanbanCardProps {
  lead: Lead;
  isOverlay?: boolean;
}

export function KanbanCard({ lead, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isOverlay ? "shadow-xl rotate-2 scale-105 cursor-grabbing" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getScoreBg(lead.score)}`}>
            {lead.score}
          </div>
          {lead.aiInsights && <Brain className="w-3.5 h-3.5 text-violet-500" />}
        </div>
        <GripVertical className="w-4 h-4 text-gray-300" />
      </div>

      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
        {lead.firstName} {lead.lastName}
      </h4>
      <p className="text-xs text-gray-500 mb-2">{lead.company}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(lead.estimatedValue)}
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize"
            >
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
