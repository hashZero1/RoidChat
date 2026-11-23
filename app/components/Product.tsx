"use client";

/**
 * AltfPlans.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single importable component for the alt.f Plans page (dock tabs: Elevate,
 * Virtual Office, On-The-Go). Port of "altf-plans-base.html".
 *
 * Stack:   Next.js (App Router) · TypeScript · Tailwind CSS · motion
 * Install: npm i motion
 * Usage:   // app/plans/page.tsx
 *          import AltfPlans from '@/components/AltfPlans';
 *          export const metadata = { title: 'alt.f Plans', description: '…' };
 *          export default function Page() { return <AltfPlans />; }
 *
 * Deep link: /plans?plan=virtual-office  (tab state is kept in ?plan=)
 * Edit content: only the PRODUCTS array below (items marked VERIFY need review).
 */

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { DM_Sans } from "next/font/google";
import Image from "next/image";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES + CONFIG (single source of truth)
   ═══════════════════════════════════════════════════════════════════════════ */

export type ProductId = "elevate" | "virtual-office" | "on-the-go";

export interface Product {
  id: ProductId;
  label: string;
  descriptor: string;
  eyebrow: string;
  headline: ReactNode;
  lede: string;
  badge: string;
  bullets: [strong: string, rest: string][];
  stats: [value: string, label: string][];
  image?: string; // TODO: real photo URL (shows dashed placeholder when empty)
  imageAlt: string;
  imageCaption: string;
  proof?: string; // TODO: e.g. "10,000+ monthly visitors" (replaces caption when set)
  pillsLabel: string;
  pills: string[];
  price: { from: string; amount: string; unit: string; note: string };
  cta: { label: string; href: string };
  trust: string[];
  steps: [title: string, text: string][];
  faq: [question: string, answer: string][];
}

const Accent = ({ children }: { children: ReactNode }) => (
  <span className="text-[color:var(--green-ink)]">{children}</span>
);

const CITIES = ["Delhi", "Gurgaon", "Noida", "Hyderabad"];

export const PRODUCTS: Product[] = [
  {
    id: "elevate",
    label: "Elevate",
    descriptor: "Brand activation",
    eyebrow: "Brand activation",
    headline: (
      <>
        Put your brand in front of thousands with <Accent>Elevate</Accent>
      </>
    ), // VERIFY: add proof for "thousands"
    lede: "One brand. One day. The café, the lobby and the attention are all yours.",
    badge: "Live availability · instant confirmation",
    bullets: [
      ["Exclusive 1-brand-per-day slot", "at your chosen centre"],
      ["High-footfall café zone", "with startups, founders and teams"],
      ["Table, power & Wi-Fi included", "for pop-ups, sampling or demos"],
    ],
    stats: [
      ["13", "centres"],
      ["4", "cities"],
      ["Mon–Fri", "bookable days"],
    ],
    image:
      "https://altf-media-local.s3.ap-south-1.amazonaws.com/websiteadminimages/1792051982859-meenakshi-post-3-NneP-B.webp",
    imageAlt: "Elevate brand activation space in an alt.f café",
    imageCaption: "Your brand, centre stage.",
    proof: "",
    pillsLabel: "Available in",
    pills: CITIES,
    price: {
      from: "Starting from",
      amount: "₹3,000",
      unit: "/ day + GST",
      note: "Delhi · Gurgaon · Noida · Hyderabad",
    },
    cta: {
      label: "Check dates & book",
      href: "https://products.altfcoworking.com/elevate",
    }, // should open centre + date picker
    trust: ["Secured by Easebuzz", "Instant confirmation", "GST invoice"],
    steps: [
      ["Pick", "Choose a city, centre and date."],
      ["Pay", "UPI, cards or net banking, secured by Easebuzz."],
      ["Done", "Get instant confirmation with your booking reference."],
    ],
    faq: [
      [
        "How many brands per day?",
        "One brand per centre per day, so the space is yours for the full day.",
      ],
      [
        "What is included?",
        "A table, power and Wi-Fi, ready for pop-ups, sampling or demos.",
      ],
      [
        "Which days can I book?",
        "Event days are Monday to Friday, across 13 centres in Delhi, Gurgaon, Noida and Hyderabad.",
      ],
    ],
  },
  {
    id: "virtual-office",
    label: "Virtual Office",
    descriptor: "Business address",
    eyebrow: "Business address",
    headline: (
      <>
        A premium business address, <Accent>without the rent</Accent>
      </>
    ),
    lede: "Register, incorporate and receive mail at an alt.f address while your team works from anywhere.",
    badge: "Online purchase · fast onboarding", // VERIFY
    bullets: [
      ["Business & GST registration", "at a professional commercial address"],
      ["Company incorporation & banking", "supported with your alt.f address"],
      ["Official mail & communication address", "for your business"],
    ],
    stats: [
      ["4", "cities"],
      ["Annual", "plan"],
    ],
    image:
      "https://altf-media-local.s3.ap-south-1.amazonaws.com/websiteadminimages/1782105505373-team-room-banner-WnjLTl.webp",
    imageAlt: "alt.f reception and business lounge",
    imageCaption: "Your address, our reception.",
    proof: "",
    pillsLabel: "Choose a city",
    pills: CITIES,
    price: {
      from: "Starting from",
      amount: "₹10,000",
      unit: "/ year + GST",
      note: "Delhi · Gurgaon · Noida · Hyderabad",
    },
    cta: {
      label: "Choose a city & plan",
      href: "https://products.altfcoworking.com/virtual-office",
    },
    trust: ["Secured by Easebuzz", "GST invoice", "Cancellation terms"],
    steps: [
      // VERIFY: step copy
      ["Choose", "Pick your city and Virtual Office plan."],
      ["Pay", "UPI, cards or net banking, secured by Easebuzz."],
      ["Get started", "Receive your address details and start using them."],
    ],
    faq: [
      [
        "Can I use it for GST registration?",
        "Yes. The address supports business and GST registration, company incorporation and banking.",
      ],
      [
        "Do I get an official mailing address?",
        "Yes. You get an official mail and communication address for your business.",
      ],
      [
        "How is it billed?",
        "From ₹10,000 per year + GST, in Delhi, Gurgaon, Noida or Hyderabad.",
      ],
    ],
  },
  {
    id: "on-the-go",
    label: "On-The-Go",
    descriptor: "Flexible office",
    eyebrow: "Flexible office",
    headline: (
      <>
        Work from any alt.f centre, <Accent>on your schedule</Accent>
      </>
    ),
    lede: "Buy credits once. Use desks, meeting rooms and the content room at any alt.f centre.",
    badge: "Pay online · start working immediately",
    bullets: [
      ["Prepaid credits", "with no long-term lock-in"],
      ["Desks, meeting rooms & content room", "at any alt.f centre"],
      ["Pay online and start working", "right away"],
    ],
    stats: [
      ["13", "centres"],
      ["5", "plan tiers"],
      ["0", "lock-in"],
    ],
    image:
      "https://altf-media-local.s3.ap-south-1.amazonaws.com/websiteadminimages/1782105541281-tr-slide-2-zp6rxB.webp",
    imageAlt: "Open desks and meeting rooms at an alt.f centre",
    imageCaption: "Any desk. Any centre.",
    proof: "",
    pillsLabel: "Tiers",
    pills: ["Core", "Plus", "Pro", "Prime", "Elite"],
    price: {
      from: "Starting from",
      amount: "₹5,000",
      unit: "+ GST",
      note: "Core plan · includes 5+ day passes",
    }, // VERIFY wording
    cta: {
      label: "See plans",
      href: "https://products.altfcoworking.com/on-the-go   ",
    },
    trust: ["Secured by Easebuzz", "No lock-in", "GST invoice"],
    steps: [
      ["Pick", "Choose a tier: Core, Plus, Pro, Prime or Elite."],
      ["Pay", "UPI, cards or net banking, secured by Easebuzz."],
      ["Work", "Use your credits at any alt.f centre."],
    ],
    faq: [
      [
        "How do credits work?",
        "Buy prepaid credits once and use them for desks, meeting rooms and the content room at any alt.f centre.",
      ],
      [
        "Is there a lock-in?",
        "No. There is no long-term lock-in and no heavy commitment.",
      ],
      [
        "How do I pay?",
        "UPI, cards or net banking, secured by Easebuzz. You can start working immediately.",
      ],
    ],
  },
];

const DEFAULT_ID: ProductId = "elevate";
const toId = (v: string | null | undefined): ProductId =>
  (PRODUCTS.find((p) => p.id === v)?.id ?? DEFAULT_ID) as ProductId;

/* ═══════════════════════════════════════════════════════════════════════════
   TRACKING (dataLayer stub: swap for GA4 / PostHog / etc.)
   ═══════════════════════════════════════════════════════════════════════════ */

// declare global {
//   interface Window {
//     dataLayer?: Record<string, unknown>[];
//   }
// }

const track = (event: string, data: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  //   (window.dataLayer = window.dataLayer || []).push({ event, ...data });
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCOPED CSS: only what Tailwind utilities can't express cleanly:
   design tokens, per-product tint theming (animatable via @property),
   and the two gradient backgrounds.
   ═══════════════════════════════════════════════════════════════════════════ */

const CSS = `
@property --tint   { syntax: '<color>'; inherits: true; initial-value: #eef4ea; }
@property --tint-2 { syntax: '<color>'; inherits: true; initial-value: #d9e7d1; }

.altf-plans {
  color-scheme: light;
  --bg: #ffffff;
  --bg-alt: #f7f7f7;
  --fg: #2d2e2e;
  --fg-mute: #596579;
  --fg-soft: #6b7482;
  --green: #78956c;            /* decorative only (fills, dots, borders) */
  --green-ink: #4f6746;        /* text + button fill, AA on white */
  --green-ink-hover: #415839;
  --border: #e8e8e8;
  --tint: #eef4ea;
  --tint-2: #d9e7d1;
  transition: --tint .45s ease, --tint-2 .45s ease;
}
.altf-plans[data-product="elevate"]        { --tint: #eef4ea; --tint-2: #d9e7d1; }
.altf-plans[data-product="virtual-office"] { --tint: #edf2f7; --tint-2: #d3e1ee; }
.altf-plans[data-product="on-the-go"]      { --tint: #f8f1e6; --tint-2: #efddbd; }

.altf-plans :focus-visible { outline: 2px solid var(--green-ink); outline-offset: 3px; border-radius: 4px; }

.altf-hero::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background:
    radial-gradient(60% 80% at 85% 0%, var(--tint-2) 0%, transparent 70%),
    linear-gradient(180deg, var(--tint) 0%, #fff 100%);
}
.altf-media { background: linear-gradient(135deg, var(--tint-2), var(--tint)); }

@media (prefers-reduced-motion: reduce) { .altf-plans { transition: none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED CLASS STRINGS (full literals so Tailwind can detect them)
   ═══════════════════════════════════════════════════════════════════════════ */

const INNER =
  "mx-auto w-full px-[max(clamp(16px,3vw,40px),env(safe-area-inset-left,0px))]";
const SERIF =
  "[font-family:Charter,Georgia,'Times_New_Roman',serif] font-normal tracking-[-0.025em]";
const SECTION_PAD = "py-[clamp(40px,6vw,64px)]";
const BTN_PRIMARY =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] border border-[color:var(--green-ink)] bg-[var(--green-ink)] px-[22px] py-3 text-[15px] font-semibold text-white transition-colors hover:border-[color:var(--green-ink-hover)] hover:bg-[var(--green-ink-hover)]";
const BTN_PRIMARY_LG =
  "inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] border border-[color:var(--green-ink)] bg-[var(--green-ink)] px-[26px] py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-[color:var(--green-ink-hover)] hover:bg-[var(--green-ink-hover)]";
const BTN_OUTLINE =
  "rounded-[2px] border border-[color:var(--green-ink)] bg-white px-4 py-[9px] text-sm 2xl:text-lg cursor-pointer font-semibold text-[color:var(--green-ink)] transition-colors hover:bg-[var(--tint)]";
const H2 = `text-[length:clamp(24px,3.4vw,36px)] leading-[1.15] [text-wrap:balance] ${SERIF}`;

/* ═══════════════════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════════════════ */

const CheckIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 6l3 3 5-5"
      stroke="#4f6746"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const TickIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="flex-none text-[color:var(--green-ink)]"
  >
    <path
      d="M3 8.5l3.2 3L13 4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 13L13 3M13 3H5M13 3V11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const WhatsAppIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.057 23.571a.5.5 0 0 0 .612.612l5.726-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.698-.5-5.254-1.375l-.376-.218-3.898 1.003 1.003-3.898-.218-.376A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER + DOCK
   ═══════════════════════════════════════════════════════════════════════════ */

interface SelectFn {
  (id: ProductId, opts?: { scroll?: boolean }): void;
}

function Dock({
  activeId,
  onSelect,
}: {
  activeId: ProductId;
  onSelect: SelectFn;
}) {
  const tabRefs = useRef<Partial<Record<ProductId, HTMLButtonElement | null>>>(
    {},
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const i = PRODUCTS.findIndex((p) => p.id === activeId);
    const n = PRODUCTS.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = PRODUCTS[next].id;
    onSelect(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <nav
      role="tablist"
      aria-label="alt.f products"
      onKeyDown={onKeyDown}
      className="fixed bottom-[calc(12px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 inline-flex -translate-x-1/2 gap-0.5 rounded-full border border-[color:var(--border)] bg-white p-1 shadow-[0_10px_32px_rgba(40,50,40,.18)] min-[720px]:absolute min-[720px]:bottom-auto min-[720px]:top-1/2 min-[720px]:-translate-y-1/2 min-[720px]:shadow-[0_6px_24px_rgba(40,50,40,.08)]"
    >
      {PRODUCTS.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            ref={(el) => {
              tabRefs.current[p.id] = el;
            }}
            id={`altf-tab-${p.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="altf-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(p.id)}
            className={`relative flex min-h-12 cursor-pointer flex-col items-center justify-center whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold leading-[1.15] transition-colors min-[720px]:px-[18px] min-[720px]:py-1.5 min-[720px]:text-sm min-[1100px]:px-[28px] ${
              active
                ? "text-white"
                : "text-[color:var(--fg-mute)] hover:text-[color:var(--fg)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="altf-dock-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[var(--green-ink)]"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative z-10">{p.label}</span>
            <small className="relative z-10 mt-px hidden text-[11px] font-normal opacity-85 min-[1100px]:block">
              {p.descriptor}
            </small>
          </button>
        );
      })}
    </nav>
  );
}

function SiteHeader({
  activeId,
  onSelect,
}: {
  activeId: ProductId;
  onSelect: SelectFn;
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/[.67]">
      <div
        className={`${INNER} relative flex min-h-19 items-center justify-between`}
      >
        <Link href="/" className="block group">
          <Image
            src="https://altf-media-local.s3.ap-south-1.amazonaws.com/websiteadminimages/1781868343997-img_header_logo-mqb42l.webp"
            alt="alt.f Coworking"
            className="w-[80px] h-[38px] lg:w-[68px] xl:w-[100px] 2xl:w-[100px] 2xl:h-[45px] 3xl:w-[110px] 3xl:h-[55px] object-contain transition-opacity duration-200 group-hover:opacity-80"
            width={104}
            height={50}
            priority
          />
        </Link>

        <Dock activeId={activeId} onSelect={onSelect} />

        <Link
          href="https://products.altfcoworking.com/cart"
          onClick={() => track("my_bookings", { plan: activeId })}
          className="inline-flex items-center gap-1.5 rounded-[2px] px-3 py-[7px] text-sm font-medium text-[color:var(--fg-mute)] transition-colors hover:bg-[var(--tint)] hover:text-[color:var(--green-ink)]"
        >
          <CalendarIcon />
          <span>My bookings</span>
        </Link>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL SECTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Staggered enter for each section inside the active panel. */
function Enter({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Hero({ p }: { p: Product }) {
  return (
    <section
      aria-labelledby="altf-hero-title"
      className="altf-hero relative isolate overflow-hidden py-[clamp(28px,5vw,56px)]"
    >
      <div
        className={`${INNER} grid items-center gap-7 min-[900px]:grid-cols-[1.05fr_.95fr] min-[900px]:gap-14`}
      >
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-[5px] text-xs text-[color:var(--fg)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
            {p.badge}
          </span>

          <p className="mb-2.5 mt-[18px] text-[11px] font-semibold uppercase tracking-[.14em] text-[color:var(--green-ink)]">
            {p.eyebrow}
          </p>
          <h1
            id="altf-hero-title"
            className={`mb-3.5 text-[length:clamp(28px,4.6vw,46px)] leading-[1.1] [text-wrap:balance] ${SERIF}`}
          >
            {p.headline}
          </h1>
          <p className="mb-5 max-w-[46ch] text-base text-[color:var(--fg-mute)]">
            {p.lede}
          </p>

          <ul className="mb-[22px] flex flex-col gap-2.5">
            {p.bullets.map(([strong, rest]) => (
              <li
                key={strong}
                className="flex items-start gap-2.5 text-sm text-[color:var(--fg-mute)]"
              >
                <span className="mt-px grid h-5 w-5 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--green)_16%,white)]">
                  <CheckIcon />
                </span>
                <span>
                  <strong className="font-semibold text-[color:var(--fg)]">
                    {strong}
                  </strong>{" "}
                  {rest}
                </span>
              </li>
            ))}
          </ul>

          {/* Slim stats strip */}
          <ul
            aria-label="Key facts"
            className="mb-[18px] flex flex-wrap gap-y-1.5 text-[13px] text-[color:var(--fg-mute)]"
          >
            {p.stats.map(([value, label], i) => (
              <li key={label} className="inline-flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-3 h-[3px] w-[3px] rounded-full bg-[var(--green)]"
                  />
                )}
                <b className="mr-1 font-bold text-[color:var(--fg)]">{value}</b>
                {label}
              </li>
            ))}
          </ul>

          {/* Price + CTA + trust, one glance */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-[color:var(--border)] bg-white px-5 py-[18px]">
            <div>
              <p className="text-xs text-[color:var(--fg-soft)]">
                {p.price.from}
              </p>
              <p className="text-[28px] font-bold leading-[1.1]">
                {p.price.amount}
                <span className="ml-1 text-[13px] font-normal text-[color:var(--fg-soft)]">
                  {p.price.unit}
                </span>
              </p>
              <p className="mt-0.5 text-[13px] text-[color:var(--fg-soft)]">
                {p.price.note}
              </p>
            </div>
            <Link
              href={p.cta.href}
              onClick={() =>
                track("cta_click", { plan: p.id, placement: "hero" })
              }
              className={BTN_PRIMARY_LG}
            >
              {p.cta.label}
              <ArrowIcon />
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-[color:var(--fg-mute)]">
            {p.trust.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <TickIcon />
                {t}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <Link
                href="https://products.altfcoworking.com/policies"
                className="underline underline-offset-2"
              >
                Cancellation &amp; terms
              </Link>
            </span>
          </div>
        </div>

        {/* Image */}
        <div>
          <div className="altf-media relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-[color:var(--border)]">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.imageAlt}
                width={800}
                height={600}
                loading="eager"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                role="img"
                aria-label={p.imageAlt}
                className="absolute inset-3.5 grid place-items-center rounded-[2px] border-[1.5px] border-dashed p-6 text-center text-[13px] text-[color:var(--fg-mute)] [border-color:color-mix(in_srgb,var(--green)_55%,transparent)]"
              >
                <div>
                  <b className="mb-1 block text-[color:var(--fg)]">
                    Add real photo
                  </b>
                  {p.imageAlt}
                </div>
              </div>
            )}
            {/* <p className="absolute inset-x-3.5 bottom-3.5 rounded-[2px] bg-white/90 px-3 py-2 text-xs text-[color:var(--fg-mute)]">
              {p.proof || p.imageCaption}
            </p> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps({ p }: { p: Product }) {
  return (
    <section aria-labelledby="altf-steps-title" className={SECTION_PAD}>
      <div className={INNER}>
        <div className="mb-7">
          <h2 id="altf-steps-title" className={H2}>
            Three steps. <Accent>That&apos;s it.</Accent>
          </h2>
        </div>

        <ol className="grid gap-3.5 min-[800px]:grid-cols-3 min-[800px]:gap-5">
          {p.steps.map(([title, text], i) => (
            <li
              key={title}
              className="rounded-[2px] border border-[color:var(--border)] bg-white p-[22px]"
            >
              <span className="text-[13px] font-bold tracking-[.08em] text-[color:var(--green-ink)]">
                0{i + 1}
              </span>
              <h3 className="mb-1 mt-1.5 text-2xl">{title}</h3>
              <p className="text-lg text-[color:var(--fg-mute)]">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mb-5 mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-0.5 text-xs text-[color:var(--fg-soft)]">
            {p.pillsLabel}:
          </span>
          <ul className="flex flex-wrap items-center gap-2">
            {p.pills.map((x) => (
              <li
                key={x}
                className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs text-[color:var(--fg)]"
              >
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Faq({ p }: { p: Product }) {
  return (
    <section
      aria-labelledby="altf-faq-title"
      className={`bg-[var(--bg-alt)] ${SECTION_PAD}`}
    >
      <div className={INNER}>
        <div className="mb-7">
          <h2 id="altf-faq-title" className={H2}>
            Good to know
          </h2>
        </div>

        <div className="max-w-[760px]">
          {p.faq.map(([q, a]) => (
            <details
              key={q}
              className="group border-t border-[color:var(--border)] last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-0.5 py-4 text-[18px]  [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden="true"
                  className="text-xl font-normal text-[color:var(--green-ink)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] px-0.5 pb-4 text-sm text-[color:var(--fg-mute)]">
                {a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-7">
          <Link
            href={p.cta.href}
            onClick={() =>
              track("cta_click", { plan: p.id, placement: "closing" })
            }
            className={BTN_PRIMARY}
          >
            {p.cta.label}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** The three sections that change with the active tab. */
function ProductPanel({ p }: { p: Product }) {
  return (
    <>
      <Enter index={0}>
        <Hero p={p} />
      </Enter>
      <Enter index={1}>
        <Steps p={p} />
      </Enter>
      <Enter index={2}>
        <Faq p={p} />
      </Enter>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED SECTIONS (do not change with the tab)
   ═══════════════════════════════════════════════════════════════════════════ */

function SwitcherAndHelp({
  activeId,
  onSelect,
}: {
  activeId: ProductId;
  onSelect: SelectFn;
}) {
  return (
    <section
      aria-labelledby="altf-switch-title"
      className={`bg-[var(--bg-alt)] ${SECTION_PAD}`}
    >
      <div className={INNER}>
        <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-3 rounded-[2px] border border-[color:var(--border)] bg-white px-6 py-[22px]">
          <p id="altf-switch-title" className="text-xl">
            Looking for something else?
          </p>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.filter((p) => p.id !== activeId).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id, { scroll: true })}
                className={BTN_OUTLINE}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3.5 rounded-[2px] border border-[color:var(--border)] bg-white px-6 py-5">
          <div>
            <h3 className="text-3xl">Need assistance?</h3>
            <p className="text-sm mt-1 text-[color:var(--fg-mute)]">
              Not sure which centre, date or plan fits? Our team replies fast.
            </p>
          </div>
          <a
            href="https://wa.me/919958500731"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp", { plan: activeId })}
            className={BTN_PRIMARY}
          >
            <WhatsAppIcon />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function SiteFooter({ onSelect }: { onSelect: SelectFn }) {
  const linkCls = "transition-colors hover:text-[color:var(--green-ink)]";
  return (
    <footer
      id="contact"
      className="border-t border-[color:var(--border)] bg-[var(--bg-alt)] py-11"
    >
      <div
        className={`${INNER} grid gap-8 min-[700px]:grid-cols-[1.2fr_1fr_1fr]`}
      >
        <div>
          <p className="mb-1.5 font-bold">alt.f coworking</p>
          <p className="text-sm text-[color:var(--fg-soft)]">
            © alt.f coworking. All rights reserved.
          </p>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Products</p>
          <ul className="flex flex-col gap-[9px] text-sm text-[color:var(--fg-mute)]">
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <a
                  href={`?plan=${p.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(p.id, { scroll: true });
                  }}
                  className={linkCls}
                >
                  {p.label}: {p.descriptor.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Support</p>
          <ul className="flex flex-col gap-[9px] text-sm text-[color:var(--fg-mute)]">
            <li>
              <a href="tel:+919958500731" className={linkCls}>
                +91 99585 00731
              </a>
            </li>
            <li>
              <a href="mailto:sales@altfcoworking.com" className={linkCls}>
                sales@altfcoworking.com
              </a>
            </li>
            <li>
              <Link href="/terms" className={linkCls}>
                Cancellation &amp; terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════════════════ */

function AltfPlansInner() {
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState<ProductId>(() =>
    toId(searchParams.get("plan")),
  );
  const active = PRODUCTS.find((p) => p.id === activeId) ?? PRODUCTS[0];

  const select = useCallback<SelectFn>(
    (id, opts) => {
      if (id !== activeId) {
        setActiveId(id);
        try {
          // Keep the tab in the URL: deep-linkable, survives refresh, back button works.
          const url = new URL(window.location.href);
          url.searchParams.set("plan", id);
          window.history.pushState(null, "", url);
        } catch {
          /* ignore (e.g. sandboxed preview) */
        }
      }
      if (opts?.scroll) window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [activeId],
  );

  // Browser back / forward
  useEffect(() => {
    const onPop = () =>
      setActiveId(
        toId(new URLSearchParams(window.location.search).get("plan")),
      );
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Title + tab_view tracking (fires on first view too)
  useEffect(() => {
    document.title = `alt.f Plans · ${active.label}`;
    track("tab_view", { plan: active.id });
  }, [active.id, active.label]);

  return (
    <MotionConfig reducedMotion="user">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        data-product={active.id}
        className={`altf-plans ${dmSans.className} min-h-screen bg-white text-[15px] leading-[1.6] text-[color:var(--fg)] antialiased max-[719px]:pb-[84px]`}
      >
        <SiteHeader activeId={activeId} onSelect={select} />

        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              id="altf-panel"
              role="tabpanel"
              aria-labelledby={`altf-tab-${active.id}`}
              tabIndex={-1}
              className="min-h-[60vh] outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ProductPanel p={active} />
            </motion.div>
          </AnimatePresence>

          <SwitcherAndHelp activeId={activeId} onSelect={select} />
        </main>

        <SiteFooter onSelect={select} />
      </div>
    </MotionConfig>
  );
}

/** Suspense is required because useSearchParams() reads the URL on the client. */
export default function AltfPlans() {
  return (
    <Suspense fallback={null}>
      <AltfPlansInner />
    </Suspense>
  );
}
