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
  NotebookText,
  ShieldCheck,
  UserRound,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
  GripVertical,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ─── Data ───────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Pipeline", href: "#pipeline" },
  { label: "Features", href: "#features" },
  { label: "Automation", href: "#automation" },
];

const pipelineSteps = [
  { number: "01", title: "Cold Lead",      description: "Prospect captured, tagged, and queued for first outreach.",           bar: "bg-slate-300 dark:bg-slate-600" },
  { number: "02", title: "Contacted",      description: "Initial outreach sent; account is actively being worked.",            bar: "bg-sky-400" },
  { number: "03", title: "Demo Booked",    description: "A session is scheduled and the opportunity has a clear next step.",   bar: "bg-cyan-500" },
  { number: "04", title: "Demo Done",      description: "Walkthrough complete; follow-up notes captured and assigned.",        bar: "bg-teal-500" },
  { number: "05", title: "Proposal Sent",  description: "Commercials and onboarding terms are in front of the buyer.",        bar: "bg-emerald-500" },
  { number: "06", title: "Pilot Closed",   description: "Deal signed, handoff documented, and client is live.",               bar: "bg-green-600" },
];

const featureCards: Array<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: KanbanSquare, title: "Visual Kanban Pipeline",      description: "Drag-and-drop deal management across every stage—built for school-sales workflows." },
  { icon: UserRound,    title: "Prospect Profiles",           description: "Contact details, school context, and deal ownership consolidated in a single view." },
  { icon: NotebookText, title: "Timestamped Activity Log",    description: "Every call, follow-up, and handoff captured with a clean, searchable history." },
  { icon: BarChart3,    title: "Analytics Dashboard",         description: "Pipeline health, close rates, and overdue follow-up pressure surfaced at a glance." },
  { icon: ShieldCheck,  title: "Role-Based Access Control",   description: "Precise permissions for admins, managers, and agents—no more, no less." },
];

const overdueProspects = [
  { school: "Northwind Academy",  stage: "Demo Done",      due: "Due today, 9:00 AM",      tag: "DUE TODAY", tagColor: "text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-900/20 dark:border-sky-700/40" },
  { school: "Harborview School",  stage: "Proposal Sent",  due: "3 days overdue",           tag: "OVERDUE",   tagColor: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-900/20 dark:border-rose-700/40" },
  { school: "Cedar Grove School", stage: "Contacted",      due: "Completed this morning",   tag: "COMPLETE",  tagColor: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/40" },
];

const kpis = [
  { value: 128, label: "Total Prospects",    trend: "+18% this month" },
  { value: 34,  label: "Conversion Rate",    trend: "+4 pts vs last month", suffix: "%" },
  { value: 7,   label: "Overdue Follow-ups", trend: "−5 from last week" },
  { value: 12,  label: "Closed This Month",  trend: "+3 active pilots" },
];

const footerLinks = {
  product: [
    { label: "Pipeline",   href: "#pipeline" },
    { label: "Features",   href: "#features" },
    { label: "Automation", href: "#automation" },
  ],
  company: [
    { label: "About",    href: "#" },
    { label: "Blog",     href: "#" },
    { label: "Careers",  href: "#" },
  ],
  legal: [
    { label: "Privacy Policy",   href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

// ─── Draggable Kanban data ───────────────────────────────────────────────────────

type CardId = string;
type ColKey = "contacted" | "demo" | "closed";

interface KanbanCard {
  id: CardId;
  title: string;
  note: string;
  status: string;
  statusColor: string;
}

const initialKanban: Record<ColKey, { label: string; accent: string; ring: string; bg: string; cards: KanbanCard[] }> = {
  contacted: {
    label: "Contacted", accent: "bg-sky-500",
    ring: "border-sky-100 dark:border-sky-900/40",
    bg: "bg-sky-50/60 dark:bg-sky-900/10",
    cards: [
      { id: "c1", title: "Northwind Academy",  note: "Follow-up check synced",    status: "DUE TODAY", statusColor: "text-sky-600 dark:text-sky-300" },
      { id: "c2", title: "Harborview School",  note: "Needs a short call recap",  status: "OVERDUE",   statusColor: "text-rose-600 dark:text-rose-400" },
    ],
  },
  demo: {
    label: "Demo Done", accent: "bg-teal-500",
    ring: "border-teal-100 dark:border-teal-900/40",
    bg: "bg-teal-50/60 dark:bg-teal-900/10",
    cards: [
      { id: "d1", title: "Cedar Grove School", note: "Follow-up check synced",         status: "COMPLETE",  statusColor: "text-emerald-600 dark:text-emerald-400" },
      { id: "d2", title: "Summit Charter",     note: "Waiting on stakeholder notes",   status: "DUE TODAY", statusColor: "text-sky-600 dark:text-sky-300" },
    ],
  },
  closed: {
    label: "Pilot Closed", accent: "bg-emerald-600",
    ring: "border-emerald-100 dark:border-emerald-900/40",
    bg: "bg-emerald-50/60 dark:bg-emerald-900/10",
    cards: [
      { id: "p1", title: "Juniper Hill Prep",   note: "Follow-up check synced",       status: "COMPLETE", statusColor: "text-emerald-600 dark:text-emerald-400" },
      { id: "p2", title: "Riverbend Academy",   note: "Contract and kickoff aligned",  status: "COMPLETE", statusColor: "text-emerald-600 dark:text-emerald-400" },
    ],
  },
};

// ─── Motion Variants ─────────────────────────────────────────────────────────────

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut", staggerChildren: 0.09 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: "easeOut" } },
};

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } },
};

// ─── Wave Divider ────────────────────────────────────────────────────────────────

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={cn("pointer-events-none -mx-5 sm:-mx-6 lg:-mx-8 overflow-hidden leading-none", flip && "rotate-180")}>
      <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14 text-slate-50 dark:text-slate-950/60" preserveAspectRatio="none">
        <path
          d="M0 28 C240 56 480 0 720 28 C960 56 1200 0 1440 28 L1440 56 L0 56 Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path
          d="M0 38 C360 10 720 52 1080 20 C1260 8 1380 36 1440 42 L1440 56 L0 56 Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
}

// ─── Dot Grid Background ─────────────────────────────────────────────────────────

function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.18]"
      style={{
        backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:text-cyan-300">
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) { setDisplayValue(value); return; }
    let frame = 0;
    const duration = 1100;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// ─── Draggable Kanban Demo ────────────────────────────────────────────────────────

function DraggableKanban() {
  const [columns, setColumns] = useState(initialKanban);
  const [dragging, setDragging] = useState<{ cardId: CardId; fromCol: ColKey } | null>(null);
  const [dragOver, setDragOver] = useState<ColKey | null>(null);
  const [lastMoved, setLastMoved] = useState<CardId | null>(null);

  const colKeys = Object.keys(columns) as ColKey[];

  const handleDragStart = (cardId: CardId, fromCol: ColKey) => {
    setDragging({ cardId, fromCol });
  };

  const handleDrop = (toCol: ColKey) => {
    if (!dragging || dragging.fromCol === toCol) { setDragging(null); setDragOver(null); return; }
    const { cardId, fromCol } = dragging;
    const card = columns[fromCol].cards.find(c => c.id === cardId);
    if (!card) return;

    setColumns(prev => {
      const next = { ...prev };
      next[fromCol] = { ...prev[fromCol], cards: prev[fromCol].cards.filter(c => c.id !== cardId) };
      next[toCol] = { ...prev[toCol], cards: [...prev[toCol].cards, card] };
      return next;
    });
    setLastMoved(cardId);
    setDragging(null);
    setDragOver(null);
    setTimeout(() => setLastMoved(null), 1200);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-slate-900/80">
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Live Demo — drag cards between columns</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">Active Pipeline — Q2 2025</h2>
        <p className="mt-1 text-sm text-slate-400">3 active stages · Try dragging a card →</p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {colKeys.map((colKey) => {
          const col = columns[colKey];
          const isOver = dragOver === colKey;
          return (
            <div
              key={colKey}
              onDragOver={(e) => { e.preventDefault(); setDragOver(colKey); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(colKey)}
              className={cn(
                "rounded-xl border p-3 transition-all duration-200",
                col.ring, col.bg,
                isOver && "ring-2 ring-cyan-400 ring-offset-1 scale-[1.01]"
              )}
            >
              <div className="flex items-center justify-between pb-2.5">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{col.label}</p>
                <span className={cn("h-2 w-2 rounded-full", col.accent)} />
              </div>
              <p className="text-[11px] text-slate-400">{col.cards.length} prospects</p>

              <div className="mt-3 min-h-[4rem] space-y-2">
                <AnimatePresence>
                  {col.cards.map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1, scale: 1,
                        boxShadow: lastMoved === card.id ? "0 0 0 2px #06b6d4" : "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.22 }}
                      draggable
                      onDragStart={() => handleDragStart(card.id, colKey)}
                      className="cursor-grab rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-sm active:cursor-grabbing dark:border-white/8 dark:bg-slate-800/60"
                    >
                      <div className="flex items-start gap-1.5">
                        <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{card.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{card.note}</p>
                          <span className={cn("mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide", card.statusColor)}>
                            {card.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {col.cards.length === 0 && (
                  <div className={cn(
                    "flex h-12 items-center justify-center rounded-lg border-2 border-dashed text-[11px] text-slate-400 transition-colors",
                    isOver ? "border-cyan-400 bg-cyan-50/50 text-cyan-600 dark:bg-cyan-900/10" : "border-slate-200 dark:border-white/10"
                  )}>
                    {isOver ? "Drop here" : "Empty"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 dark:divide-white/8 dark:border-white/8">
        {[["12", "Prospects moving"], ["3", "Active stages"], ["9 AM", "Auto check"]].map(([val, lbl]) => (
          <div key={lbl} className="px-4 py-3 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{val}</p>
            <p className="text-[11px] text-slate-400">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pipeline Progress Bar ────────────────────────────────────────────────────────

function PipelineProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (reduceMotion) { setActiveStep(pipelineSteps.length); return; }
    return scrollYProgress.on("change", (v) => {
      // Map scroll 0.1–0.7 → steps 0–6
      const mapped = Math.round(Math.max(0, Math.min(1, (v - 0.1) / 0.6)) * pipelineSteps.length);
      setActiveStep(mapped);
    });
  }, [scrollYProgress, reduceMotion]);

  return (
    <div ref={ref}>
      {/* Horizontal progress track */}
      <div className="relative mb-10 flex items-center gap-0">
        {pipelineSteps.map((step, i) => {
          const isActive = i < activeStep;
          const isCurrent = i === activeStep - 1;
          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{ scale: isCurrent ? 1.2 : 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-500 z-10",
                    isActive
                      ? "border-cyan-600 bg-cyan-600 text-white shadow-[0_0_0_3px_rgba(8,145,178,0.18)]"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                  )}
                >
                  {isActive ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.number}
                </motion.div>
                <p className={cn(
                  "absolute top-9 hidden w-20 text-center text-[10px] font-semibold transition-colors duration-300 lg:block",
                  isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"
                )}>
                  {step.title}
                </p>
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                    animate={{ width: i < activeStep - 1 ? "100%" : i === activeStep - 1 ? "50%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step cards */}
      <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {pipelineSteps.map((step, i) => {
          const isActive = i < activeStep;
          return (
            <motion.article
              key={step.number}
              animate={{ opacity: isActive ? 1 : 0.45, y: isActive ? 0 : 6 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/8 dark:bg-slate-900/60"
            >
              <div className={cn("h-1 w-full rounded-full transition-all duration-500", isActive ? step.bar : "bg-slate-200 dark:bg-slate-700")} />
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Stage {step.number}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.description}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

// ─── Active Nav Hook ──────────────────────────────────────────────────────────────

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sectionIds]);

  return active;
}

// ─── Smooth scroll handler ────────────────────────────────────────────────────────

function useSmoothScroll() {
  return useCallback((href: string) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
}

// ─── Main Component ───────────────────────────────────────────────────────────────

export function EduFlowLandingPage() {
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(["pipeline", "features", "automation"]);
  const smoothScroll = useSmoothScroll();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    smoothScroll(href);
    setMobileOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-[#07090d] dark:text-slate-50">

      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-4rem] h-[36rem] w-[36rem] rounded-full bg-cyan-100/60 blur-[100px] dark:bg-cyan-900/20" />
        <div className="absolute right-[-6rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-sky-100/50 blur-[90px] dark:bg-sky-900/15" />
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-white/8 dark:bg-[#07090d]/85"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-[0_4px_14px_rgba(8,145,178,0.35)]">
              <GraduationCap className="h-[18px] w-[18px]" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              EduFlow <span className="font-light text-slate-400">CRM</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm lg:flex">
            {navLinks.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "relative transition-colors duration-150",
                    isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-cyan-600 dark:bg-cyan-400"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="hidden items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(8,145,178,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 sm:inline-flex"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="border-t border-slate-100 bg-white/95 px-5 pb-5 pt-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#07090d]/95 lg:hidden"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-white/8">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.3 }}
          className="relative grid items-center gap-12 overflow-hidden rounded-2xl py-20 lg:grid-cols-2 lg:py-28"
        >
          {/* dot grid only in hero */}
          <DotGrid />

          <div className="relative z-10">
            <motion.h1
              variants={staggerItem}
              className="mt-6 font-sora text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.4rem]"
            >
              Close more school deals with a pipeline built for education sales.
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mt-6 text-lg leading-relaxed text-slate-500 dark:text-slate-400"
            >
              EduFlow CRM gives your team a structured, automated workflow—from
              first contact to signed pilot—without the complexity of a generic CRM.
            </motion.p>

            <motion.div variants={staggerItem} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(8,145,178,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pipeline"
                onClick={(e) => handleNavClick(e, "#pipeline")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                View the pipeline
              </a>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              {["No credit card required", "Setup in under 5 minutes", "SOC 2 compliant"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                    <Check className="h-3 w-3" strokeWidth={2.8} />
                  </span>
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Draggable Kanban card */}
          <motion.div
            variants={staggerItem}
            initial={reduceMotion ? false : { y: 0 }}
            animate={reduceMotion ? {} : { y: [0, -10, 0] }}
            transition={reduceMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="absolute inset-x-0 -bottom-6 mx-auto h-16 w-3/4 rounded-full bg-cyan-200/40 blur-2xl dark:bg-cyan-800/30" />
            <DraggableKanban />
          </motion.div>
        </motion.section>

        <WaveDivider />

        {/* ── PIPELINE ──────────────────────────────────────────────────────── */}
        <motion.section
          id="pipeline"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 lg:py-24"
        >
          <SectionHeading
            eyebrow="Pipeline"
            title="Six stages. One clear path to a closed pilot."
            description="Scroll through to see each deal stage light up. Every school moves through the same structured sequence."
          />

          <div className="mt-10">
            <PipelineProgressBar />
          </div>
        </motion.section>

        <WaveDivider flip />

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <motion.section
          id="features"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.16 }}
          className="py-16 lg:py-24"
        >
          <SectionHeading
            eyebrow="Features"
            title="Everything a school-sales team needs, in one workspace."
            description="Purpose-built features that keep your pipeline organized and your team aligned—without the complexity of an enterprise CRM."
          />

          <motion.div variants={sectionVariants} className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  variants={staggerItem}
                  whileHover={reduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                  className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/8 dark:bg-slate-900/60"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.section>

        <WaveDivider />

        {/* ── AUTOMATION ────────────────────────────────────────────────────── */}
        <motion.section
          id="automation"
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.18 }}
          className="py-16 lg:py-24"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Card */}
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.07)] dark:border-white/10 dark:bg-slate-900/80">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">9:00 AM digest</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">Overdue prospects, ready to action.</h3>
                  </div>
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-700/40 dark:bg-cyan-900/20 dark:text-cyan-300">
                    4 unread
                  </span>
                </div>

                <div className="space-y-2 p-4">
                  {overdueProspects.map((item) => (
                    <motion.div
                      key={item.school}
                      whileHover={reduceMotion ? {} : { x: 2, transition: { duration: 0.15 } }}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/8 dark:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.school}</p>
                          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.stage}</p>
                        </div>
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]", item.tagColor)}>
                          {item.tag}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900/60">
                        <span className="text-slate-500">{item.due}</span>
                        <a href="#" className="inline-flex items-center gap-1 font-medium text-cyan-600 dark:text-cyan-400">
                          Open <Link2 className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                      <BellRing className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">In-app notifications</p>
                      <p className="text-xs text-slate-400">Alerts accumulate in history</p>
                    </div>
                  </div>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white">4</span>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="Automation"
                title="Your morning digest, delivered before the first call."
                description="A scheduled job runs every day at 9 AM—scanning open prospects, dispatching follow-up alerts, and surfacing overdue accounts in-app so nothing is missed."
              />
              <ul className="mt-8 space-y-4">
                {[
                  "Daily scan for overdue prospects at 9:00 AM",
                  "Formatted email alerts with direct deep-links",
                  "In-app notification bell with unread counter",
                  "Full alert history retained for audit and review",
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                      <Check className="h-3 w-3" strokeWidth={2.8} />
                    </span>
                    <span className="text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <WaveDivider flip />

        {/* ── ANALYTICS ─────────────────────────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.18 }}
          className="py-16 lg:py-24"
        >
          <SectionHeading
            eyebrow="Analytics"
            title="Pipeline performance, visible at a glance."
            description="Key metrics that keep the commercial picture clear—no digging through reports, no ambiguity about where the business stands."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <motion.article
                key={kpi.label}
                variants={staggerItem}
                whileHover={reduceMotion ? {} : { y: -3, transition: { duration: 0.18 } }}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/8 dark:bg-slate-900/60"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                <p className="mt-3 text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  <CountUp value={kpi.value} suffix={kpi.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium text-cyan-600 dark:text-cyan-400">{kpi.trend}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <motion.section
          variants={sectionVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          className="py-10 pb-16"
        >
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 px-8 py-14 text-center shadow-[0_20px_60px_rgba(8,145,178,0.3)] sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Get started today</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Turn scattered leads into a pipeline your team can trust.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cyan-100 sm:text-lg">
              Spin up EduFlow CRM and move schools from cold to closed with a calm, consistent system.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-cyan-700 shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                Log in to your account
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-slate-50 transition-colors duration-300 dark:border-white/8 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white">
                  <GraduationCap className="h-[18px] w-[18px]" />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  EduFlow <span className="font-light text-slate-400">CRM</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Modern CRM software purpose-built for education sales teams. From first contact to signed pilot.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {([Twitter, Linkedin, Github, Mail] as LucideIcon[]).map((Icon, i) => (
                  <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-slate-200">
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { heading: "Product", links: footerLinks.product },
              { heading: "Company", links: footerLinks.company },
              { heading: "Legal",   links: footerLinks.legal },
            ].map((group) => (
              <div key={group.heading}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{group.heading}</p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row dark:border-white/8">
            <p>© {new Date().getFullYear()} EduFlow CRM. All rights reserved.</p>
            <p>Built for school-sales teams that move fast.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
