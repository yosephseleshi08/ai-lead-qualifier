"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTenant } from "@/lib/mock-data";
import { Palette, Target, Users, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Settings</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 dark:text-gray-400 mt-1">Manage your workspace and preferences</motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-blue-500" />White Label</CardTitle>
            <CardDescription>Customize your workspace appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
              <Input defaultValue={mockTenant.name} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" defaultValue={mockTenant.primaryColor} className="w-10 h-10 rounded-lg cursor-pointer" />
                <Input defaultValue={mockTenant.primaryColor} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Domain</label>
              <Input defaultValue={mockTenant.domain} className="mt-1" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-violet-500" />Ideal Customer Profile</CardTitle>
            <CardDescription>Define who your AI should prioritize</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Industries</label>
              <Input defaultValue={mockTenant.targetIndustries.join(", ")} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
              <Input defaultValue={mockTenant.targetCompanySize} className="mt-1" />
            </div>
            <Button>Update ICP</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-emerald-500" />Team Management</CardTitle>
            <CardDescription>Manage team members and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Invite Team Member</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-amber-500" />API Keys</CardTitle>
            <CardDescription>Manage your API access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate New Key</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
