"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  Star,
  Quote,
  Play,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Lead Scoring",
    description: "Our DeepSeek AI engine scores leads with intelligent accuracy, analyzing behavioral signals, company data, and engagement patterns.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Smart Prioritization",
    description: "Automatically surface hot leads that are most likely to convert. Never miss a high-value opportunity again.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    description: "AI predicts your quarterly revenue with confidence, factoring in pipeline velocity and deal risk.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "Deal Risk Alerts",
    description: "Get early warnings when deals are at risk. AI monitors engagement drops and competitor mentions in real-time.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Globe,
    title: "White-Label Ready",
    description: "Rebrand the entire platform with your logo, colors, and domain. Sell it as your own product to clients.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Drag & Drop Pipeline",
    description: "Beautiful Kanban board with real-time updates. Move leads through stages with intelligent next-step recommendations.",
    color: "from-cyan-500 to-blue-600",
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "VP Sales, TechFlow",
    content: "We closed 3x more deals in the first month. The AI copilot tells us exactly which leads to call and when.",
    avatar: "SM",
  },
  {
    name: "Marcus Chen",
    role: "Agency Owner, GrowthLab",
    content: "White-labeled this for 12 clients in one week. Each client thinks it's custom-built for them.",
    avatar: "MC",
  },
  {
    name: "Elena Rodriguez",
    role: "Sales Director, MedSync",
    content: "The revenue forecasting is scary accurate. We hit within 4% of AI's Q2 prediction.",
    avatar: "ER",
  },
];

const stats = [
  { value: "94.7%", label: "AI Accuracy" },
  { value: "3x", label: "More Deals Closed" },
  { value: "2.3h", label: "Avg Response Time" },
  { value: "$2.8M", label: "Revenue Generated" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">LeadIQ</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Now with DeepSeek AI Scoring</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Close More Deals with{" "}
              <span className="text-gradient">AI-Powered</span>{" "}
              Lead Intelligence
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The complete white-label lead qualification platform that scores, prioritizes, and converts leads 
              with AI accuracy. Deploy in hours, not months.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Play className="w-5 h-5 mr-2" /> Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
          >
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-4 text-xs text-gray-500">LeadIQ Dashboard — Enterprise Plan</span>
            </div>
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-4">
                  {["2,847 Total Leads", "634 Qualified", "$485K Revenue"].map((s) => (
                    <div key={s} className="flex-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{s.split(" ")[0]}</p>
                      <p className="text-xs text-gray-500">{s.split(" ").slice(1).join(" ")}</p>
                    </div>
                  ))}
                </div>
                <div className="h-48 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-blue-300" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-violet-600" />
                    <span className="font-semibold text-sm">AI Copilot</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">&quot;Sarah Chen is 87% likely to convert. Schedule demo within 24h.&quot;</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">+24.3% vs last month</p>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">$485,000</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Everything You Need to{" "}
              <span className="text-gradient">Win More Deals</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From AI scoring to white-label deployment, every feature is designed to make your sales team unstoppable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "$299", period: "/month", desc: "For small teams", features: ["Up to 1,000 leads", "Basic AI scoring", "Email sequences", "2 team members", "Standard support"] },
              { name: "Growth", price: "$799", period: "/month", desc: "For growing teams", features: ["Up to 10,000 leads", "Advanced AI Copilot", "White-label", "API access", "10 team members", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", period: "", desc: "For large orgs", features: ["Unlimited leads", "Custom AI models", "SSO & SAML", "Dedicated support", "SLA guarantee", "Onboarding training"] },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl bg-white dark:bg-gray-950 border ${plan.popular ? "border-violet-300 dark:border-violet-700 shadow-xl scale-105" : "border-gray-200 dark:border-gray-800"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">Most Popular</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Loved by Sales Teams
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <Quote className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-gray-700 dark:text-gray-300 mb-4">{t.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Sales?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Join 500+ sales teams using LeadIQ to close more deals with AI intelligence.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                Start Your Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-blue-200 mt-4">No credit card required. 14-day free trial.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">LeadIQ</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; 2024 LeadIQ. All rights reserved. Built for sales teams that win.
          </p>
        </div>
      </footer>
    </div>
  );
}
