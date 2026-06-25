"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  GraduationCap,
  KanbanSquare,
  Link2,
  ListTodo,
  NotebookText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { motion, useReducedMotion, useInView, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Pipeline", href: "#pipeline" },
  { label: "Features", href: "#features" },
  { label: "Automation", href: "#automation" },
];

const pipelineSteps = [
  {
    number: "01",
    title: "Cold",
    description: "New school lead captured, tagged, and ready for the first touch.",
    bar: "bg-[#c7b48e]",
  },
  {
    number: "02",
    title: "Contacted",
    description: "Outreach sent and the account is actively being worked by sales.",
    bar: "bg-[#0a8aa8]",
  },
  {
    number: "03",
    title: "Demo Booked",
    description: "A demo is locked in and the opportunity gets a clear next step.",
    bar: "bg-[#3b9db5]",
  },
  {
    number: "04",
    title: "Demo Done",
    description: "The team has run the product walkthrough and captured follow-up notes.",
    bar: "bg-[#0f6b85]",
  },
  {
    number: "05",
    title: "Proposal Sent",
    description: "Commercials and onboarding expectations are now in front of the buyer.",
    bar: "bg-[#7f8f71]",
  },
  {
    number: "06",
    title: "Pilot Closed",
    description: "The school is live, the deal is closed, and handoff is fully documented.",
    bar: "bg-[#0d6b5a]",
  },
];

const featureCards: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: KanbanSquare,
    title: "Kanban pipeline",
    description: "Move schools through a visual board that keeps every stage clear and accountable.",
  },
  {
    icon: UserRound,
    title: "Prospect profiles",
    description: "Keep contact details, school context, and ownership visible in one place.",
  },
  {
    icon: NotebookText,
    title: "Time-stamped notes",
    description: "Capture every call, follow-up, and handoff with a clean activity history.",
  },
  {
    icon: ListTodo,
    title: "Onboarding checklist",
    description: "Track the setup steps that move a buyer from signed deal to a smooth launch.",
  },
  {
    icon: WandSparkles,
    title: "Auto-completion",
    description: "Automatically advance completed tasks and reduce manual board housekeeping.",
  },
  {
    icon: BellRing,
    title: "Daily notifications",
    description: "Send a morning sweep of overdue prospects to the right people at the right time.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    description: "See the pipeline health, close rate, and overdue follow-up pressure instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Give admins, managers, and agents only the permissions they actually need.",
  },
  {
    icon: Search,
    title: "Search & filter",
    description: "Find a school fast by stage, owner, date, or status without breaking the flow.",
  },
];

const overdueProspects = [
  {
    school: "Northwind Academy",
    stage: "Demo Done",
    due: "Due today, 9:00 AM",
    tag: "DUE TODAY",
  },
  {
    school: "Harborview School",
    stage: "Proposal Sent",
    due: "3 days overdue",
    tag: "OVERDUE",
  },
  {
    school: "Cedar Grove School",
    stage: "Contacted",
    due: "Completed this morning",
    tag: "COMPLETE",
  },
];

const kpis = [
  { value: 128, label: "Total prospects", trend: "+18% this month" },
  { value: 34, label: "Conversion rate", trend: "+4 pts vs last month", suffix: "%" },
  { value: 7, label: "Overdue follow-ups", trend: "-5 from last week" },
  { value: 12, label: "Closed this month", trend: "+3 active pilots" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0a8aa8] dark:text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-sans text-3xl leading-[1.05] tracking-tight text-[#1f1812] dark:text-[#f5f7fb] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#615445] dark:text-slate-300 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function CountUp({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    const duration = 1100;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export function EduFlowLandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1812] transition-colors duration-300 dark:bg-[#08090b] dark:text-[#f4f7fb]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-0 h-96 w-96 rounded-full bg-[#d7efe9]/70 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute right-[-4rem] top-24 h-[26rem] w-[26rem] rounded-full bg-[#d4f1f8]/55 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute bottom-[-8rem] left-1/4 h-[24rem] w-[24rem] rounded-full bg-[#efe1c3]/60 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))] dark:bg-[linear-gradient(180deg,rgba(8,9,11,0.2),rgba(8,9,11,0.9))]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 pb-12 pt-4 sm:px-6 lg:px-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="sticky top-4 z-50 mb-8 rounded-full border border-[#dfd4c1]/80 bg-[#f8f4eb]/80 px-4 py-3 shadow-[0_12px_40px_rgba(72,54,32,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0e1015]/85 dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:px-5"
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#b8ddd9] bg-[#e2f2f0] text-[#0a8aa8] shadow-[0_8px_20px_rgba(10,138,168,0.12)] transition-colors duration-300 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block font-sans text-xl tracking-tight text-[#1f1812] dark:text-[#f5f7fb]">
                  EduFlow CRM
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-[#635546] transition-colors duration-300 dark:text-slate-400 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-[#0a8aa8] dark:hover:text-cyan-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle className="hidden sm:inline-flex border-[#d8c7aa] bg-[#fbf7ef] text-[#4f4335] hover:bg-[#f4ead9] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10" />
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#4f4335] transition-all duration-200 hover:bg-[#efe7da] hover:text-[#1f1812] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a8aa8] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(10,138,168,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#097d99] dark:bg-cyan-500 dark:text-[#081015] dark:hover:bg-cyan-400"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.header>

        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.28 }}
          className="flex flex-col items-center pb-20 pt-6 text-center lg:pb-24 lg:pt-10"
        >
          <div className="relative max-w-3xl w-full">
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8c7aa] bg-[#fbf7ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#6d5e4e] shadow-[0_8px_26px_rgba(87,67,41,0.07)] transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-[0_8px_26px_rgba(0,0,0,0.24)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0a8aa8]" />
              Designed for school sales teams
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="mt-6 font-sans text-4xl leading-[1.05] tracking-tight text-[#1f1812] transition-colors duration-300 dark:text-[#f5f7fb] sm:text-6xl lg:text-[5.2rem]"
            >
              Move every school from cold lead to pilot close.
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mt-6 mx-auto max-w-2xl text-lg leading-8 text-[#615445] transition-colors duration-300 dark:text-slate-300 sm:text-xl"
            >
              EduFlow CRM helps sales agents, managers, and admins track prospects,
              automate follow-ups, manage onboarding checklists, and read the
              pipeline with calm, useful analytics.
            </motion.p>

            <motion.div variants={staggerItem} className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a8aa8] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(10,138,168,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#097d99] dark:bg-cyan-500 dark:text-[#081015] dark:hover:bg-cyan-400"
              >
                Start the demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pipeline"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8c7aa] bg-[#fbf7ef] px-6 py-3 text-sm font-semibold text-[#2f2418] shadow-[0_10px_24px_rgba(87,67,41,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4ead9] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)] dark:hover:bg-white/10"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                ["6", "Pipeline stages"],
                ["10", "Step onboarding"],
                ["3", "Access roles"],
                ["9 AM", "Daily auto-checks"],
              ].map(([value, label]) => (
                <motion.div
                  key={label}
                  variants={staggerItem}
                  className="rounded-[1.4rem] border border-[#dfd4c1] bg-[#fbf7ef]/90 p-4 shadow-[0_12px_30px_rgba(72,54,32,0.06)] backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                >
                  <p className="text-2xl font-semibold text-[#1f1812] dark:text-[#f5f7fb]">{value}</p>
                  <p className="mt-2 text-sm text-[#6a5a49] dark:text-slate-400">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="pipeline"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 lg:py-20"
        >
          <SectionHeading
            eyebrow="PIPELINE"
            title="Six stages, one clear path to a closed pilot."
            description="Every school moves through the same calm sequence, so sales, managers, and admins always know exactly where a deal stands."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {pipelineSteps.map((step) => (
              <motion.article
                key={step.number}
                variants={staggerItem}
                className="rounded-[1.5rem] border border-[#ded2bf] bg-[#fbf7ef] p-4 shadow-[0_12px_30px_rgba(72,54,32,0.06)] transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              >
                <div className={cn("h-1.5 rounded-full", step.bar)} />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7c6b58] dark:text-slate-400">
                    Stage {step.number}
                  </span>
                  <span className="text-sm font-medium text-[#0a8aa8] dark:text-cyan-300">{step.number}</span>
                </div>
                <h3 className="mt-3 font-sans text-2xl tracking-tight text-[#1f1812] dark:text-[#f5f7fb]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#665949] dark:text-slate-300">{step.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="features"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.18 }}
          className="py-16 lg:py-20"
        >
          <SectionHeading
            eyebrow="FEATURES"
            title="Everything a school-sales team needs, in one workspace."
            description="The product is intentionally broad enough to keep the team aligned, but simple enough that the interface never feels busy."
          />

          <motion.div
            variants={sectionVariants}
            className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  variants={staggerItem}
                  className="rounded-[1.5rem] border border-[#ded2bf] bg-[#fbf7ef] p-5 shadow-[0_12px_30px_rgba(72,54,32,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(72,54,32,0.1)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_18px_38px_rgba(0,0,0,0.28)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b8ddd9] bg-[#e7f5f3] text-[#0a8aa8] dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-[#1f1812] dark:text-[#f5f7fb]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#665949] dark:text-slate-300">{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          id="automation"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.22 }}
          className="py-16 lg:py-20"
        >
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div variants={staggerItem} className="order-2 lg:order-1">
              <div className="rounded-[1.75rem] border border-[#d9cab6] bg-[#fcf8f0] p-4 shadow-[0_16px_42px_rgba(72,54,32,0.08)] transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_42px_rgba(0,0,0,0.22)] sm:p-5">
                <div className="flex items-center justify-between border-b border-[#e6dac8] pb-4 dark:border-white/10">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#7c6b58] dark:text-slate-400">
                      9:00 AM digest
                    </p>
                    <h3 className="mt-2 font-sans text-2xl tracking-tight text-[#1f1812] dark:text-[#f5f7fb]">
                      Overdue prospects, ready to action.
                    </h3>
                  </div>
                  <div className="rounded-full border border-[#cfe8e5] bg-[#e8f6f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0a8aa8] dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                    4 unread
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {overdueProspects.map((item) => (
                    <div
                      key={item.school}
                      className="rounded-[1.25rem] border border-[#e5d8c4] bg-[#fffdf8] p-4 transition-colors duration-300 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#1f1812] dark:text-[#f5f7fb]">{item.school}</p>
                          <p className="mt-1 text-sm text-[#6e5f50] dark:text-slate-400">{item.stage}</p>
                        </div>
                        <span className="rounded-full border border-[#e6d8bf] bg-[#f5ebda] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f5b25] dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                          {item.tag}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#f7f1e7] px-3 py-2 text-sm text-[#5f5142] dark:bg-white/5 dark:text-slate-300">
                        <span>{item.due}</span>
                        <a href="#" className="inline-flex items-center gap-1 font-medium text-[#0a8aa8] dark:text-cyan-300">
                          Open link
                          <Link2 className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#e5d8c4] bg-[#fffaf2] px-4 py-3 transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f6f4] text-[#0a8aa8] dark:bg-cyan-500/10 dark:text-cyan-300">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1f1812] dark:text-[#f5f7fb]">In-app bell</p>
                      <p className="text-sm text-[#6e5f50] dark:text-slate-400">Unread alerts accumulate in history</p>
                    </div>
                  </div>
                  <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#0a8aa8] px-2 text-sm font-semibold text-white">
                    4
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="AUTOMATION"
                title="A scheduler runs daily and sends the right alerts without babysitting."
                description="The system scans open prospects every morning, sends polished email reminders, surfaces the right accounts in-app, and keeps every alert logged for later history."
              />

              <ul className="mt-8 space-y-4">
                {[
                  "Daily scan at 9 AM for overdue open prospects",
                  "Styled email alerts with direct links",
                  "In-app notification bell with unread counter",
                  "Every alert logged for history",
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-[#5f5142]">
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f6f4] text-[#0a8aa8]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                    <span className="text-base leading-7">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 lg:py-20"
        >
          <SectionHeading
            eyebrow="ANALYTICS"
            title="Know how the pipeline is performing instantly."
            description="The KPI row keeps the commercial picture visible without forcing the team to dig through reports."
          />

          <motion.div
            variants={sectionVariants}
            className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {kpis.map((kpi) => (
              <motion.article
                key={kpi.label}
                variants={staggerItem}
                className="rounded-[1.5rem] border border-[#ded2bf] bg-[#fbf7ef] p-5 shadow-[0_12px_30px_rgba(72,54,32,0.06)] transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              >
                <p className="text-sm text-[#6d5e4e] dark:text-slate-400">{kpi.label}</p>
                <p className="mt-4 font-sans text-5xl tracking-tight text-[#1f1812] dark:text-[#f5f7fb]">
                  <CountUp value={kpi.value} suffix={kpi.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-[#0a8aa8] dark:text-cyan-300">{kpi.trend}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.16 }}
          className="py-10"
        >
          <div className="rounded-[2rem] border border-[#d8c7aa] bg-[linear-gradient(135deg,#fdf8ef_0%,#f4ead9_46%,#e5f2ef_100%)] px-6 py-10 text-center shadow-[0_18px_50px_rgba(72,54,32,0.09)] transition-colors duration-300 dark:border-white/10 dark:bg-[linear-gradient(135deg,#0f1115_0%,#10141a_55%,#0b1a1f_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:px-8 sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0a8aa8] dark:text-cyan-300">
              START HERE
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-sans text-4xl leading-tight tracking-tight text-[#1f1812] dark:text-[#f5f7fb] sm:text-5xl">
              Turn scattered leads into a pipeline you can actually run.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#615445] dark:text-slate-300 sm:text-lg">
              Spin up EduFlow CRM and watch a school move from cold to closed with
              a system that feels calm, consistent, and easy to trust.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a8aa8] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(10,138,168,0.24)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#097d99] dark:bg-cyan-500 dark:text-[#081015] dark:hover:bg-cyan-400"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8c7aa] bg-[#fbf7ef] px-6 py-3 text-sm font-semibold text-[#2f2418] shadow-[0_10px_24px_rgba(87,67,41,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#f4ead9] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)] dark:hover:bg-white/10"
              >
                Log in to your account
              </Link>
            </div>
          </div>
        </motion.section>

        <footer className="flex flex-col gap-6 border-t border-[#ded2bf] py-8 text-sm text-[#665949] transition-colors duration-300 dark:border-white/10 dark:text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 text-[#1f1812] dark:text-[#f5f7fb]">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#b8ddd9] bg-[#e7f5f3] text-[#0a8aa8] dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-sans text-2xl tracking-tight">EduFlow CRM</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-[#615445] dark:text-slate-400">
            {["Pipeline", "Features", "Automation"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="transition-colors hover:text-[#0a8aa8] dark:hover:text-cyan-300"
              >
                {label}
              </a>
            ))}
          </nav>

          <p className="max-w-sm text-[#6d5e4e] dark:text-slate-400">
             @2026 Eduflow. All rights reserve. Intern Work by FS-5
          </p>
        </footer>
      </div>
    </main>
  );
}
