"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  BrainCircuit,
  BarChart3,
  Settings,
  CreditCard,
  Zap,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTenant, mockUser } from "@/lib/mock-data";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: GitBranch },
  { name: "AI Copilot", href: "/ai-copilot", icon: MessageSquare, badge: "NEW" },
  { name: "AI Insights", href: "/ai-insights", icon: BrainCircuit },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Sequences", href: "/sequences", icon: Zap },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="flex flex-col w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              LeadIQ
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tenant Badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <Image src={mockTenant.logo || ""} alt="" width={32} height={32} className="rounded-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {mockTenant.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{mockTenant.plan} Plan</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-blue-600 dark:text-blue-400")} />
              {item.name}
              {item.badge && (
                <span className="ml-auto text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
              {item.name === "AI Insights" && !item.badge && (
                <span className="ml-auto text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <Image src={mockUser.avatar || ""} alt="" width={36} height={36} className="rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {mockUser.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{mockUser.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
