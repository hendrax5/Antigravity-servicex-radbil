"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, Shield, CreditCard, Network, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Activity className="h-6 w-6 text-primary" />
            <span>ServiceX<span className="text-primary">-Radbil</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/login" className="hover:text-foreground transition">Login</Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium hover:text-primary transition">
              Sign In
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/25">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20 inline-block mb-6">
              Next-Gen ISP Management
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Autopilot Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                MikroTik & Fiber Network
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Radius Server, Billing, Remote VPN, and OLT Management all in one powerful SaaS platform. Forget manual tracking, start scaling.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 group">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-full font-medium transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="features" className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for ISPs and RT/RW Net entrepreneurs who need reliable and automated management tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Radius AAA Engine"
              desc="Centralized authentication, authorization, and accounting for your Hotspot & PPPoE customers."
            />
            <FeatureCard
              icon={<CreditCard className="w-6 h-6 text-primary" />}
              title="Automated Billing"
              desc="Automatic invoice generation and user isolation for late payments. Never miss revenue."
            />
            <FeatureCard
              icon={<Network className="w-6 h-6 text-primary" />}
              title="OLT Management"
              desc="Manage your fiber network directly via SSH and SNMP without relying on expensive external APIs."
            />
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 text-center text-sm text-muted-foreground border-t border-border">
        <p>© 2026 ServiceX-Radbil. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
