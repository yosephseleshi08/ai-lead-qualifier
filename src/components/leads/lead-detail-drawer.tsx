"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/ui/gauge";
import { formatCurrency, formatDate, getScoreBg } from "@/lib/utils";
import {
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  DollarSign,
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  FileText,
  Calendar,
} from "lucide-react";

export function LeadDetailDrawer() {
  const { selectedLead, isLeadDetailOpen, setLeadDetailOpen, setSelectedLead } = useAppStore();

  if (!selectedLead) return null;

  return (
    <AnimatePresence>
      {isLeadDetailOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => {
              setLeadDetailOpen(false);
              setSelectedLead(null);
            }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white dark:bg-gray-950 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedLead.title} at {selectedLead.company}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLeadDetailOpen(false);
                  setSelectedLead(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>

              {/* AI Score Card */}
              {selectedLead.aiInsights && (
                <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-blue-50/50 dark:from-violet-900/10 dark:to-blue-900/10">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">AI Lead Intelligence</h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <Gauge value={selectedLead.aiInsights.score} size={100} />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Conversion Probability</span>
                          <span className="font-semibold">{Math.round(selectedLead.aiInsights.conversionProbability * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Estimated Value</span>
                          <span className="font-semibold">{formatCurrency(selectedLead.aiInsights.estimatedValue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Best Contact Time</span>
                          <span className="font-semibold">{selectedLead.aiInsights.bestContactTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Why This Score */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Why this score:</p>
                      {selectedLead.aiInsights.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          {reason}
                        </div>
                      ))}
                    </div>

                    {/* Risk Factors */}
                    {selectedLead.aiInsights.riskFactors.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">Risk Factors</p>
                        </div>
                        {selectedLead.aiInsights.riskFactors.map((risk, i) => (
                          <p key={i} className="text-sm text-red-700 dark:text-red-400">• {risk}</p>
                        ))}
                      </div>
                    )}

                    {/* Recommended Action */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Recommendation</p>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{selectedLead.aiInsights.recommendedAction}</p>
                    </div>

                    {/* Personality Profile */}
                    {selectedLead.aiInsights.personalityProfile && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-amber-500" />
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Personality Profile</p>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-400">{selectedLead.aiInsights.personalityProfile}</p>
                      </div>
                    )}

                    {/* Similar Deals */}
                    {selectedLead.aiInsights.similarDeals.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Similar Closed Deals</p>
                        <div className="space-y-2">
                          {selectedLead.aiInsights.similarDeals.map((deal, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                              <div>
                                <p className="text-sm font-medium">{formatCurrency(deal.dealValue)}</p>
                                <p className="text-xs text-gray-500">{deal.pattern}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{deal.closeTime}</p>
                                <p className="text-xs font-medium text-violet-600">{Math.round(deal.similarity * 100)}% match</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lead Info */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.email}</span>
                    </div>
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.industry}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLead.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedLead.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedLead.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Activity Timeline */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Timeline</h3>
                  <div className="space-y-4">
                    {selectedLead.activities.map((activity, i) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          {i < selectedLead.activities.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
