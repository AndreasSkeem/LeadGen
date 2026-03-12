import Link from "next/link";
import {
  MessageSquare,
  FileText,
  Users,
  ArrowRight,
  Shield,
  PhoneOff,
  Tag,
  Home,
  Building2,
  Package,
  Globe,
  Weight,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-semibold tracking-tight" style={{ color: "var(--primary)" }}>
            LeadGen
          </span>
          <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            For moving companies
          </a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-6 pt-24 pb-28"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 92% 15%, rgba(196,137,92,0.08) 0%, transparent 65%)",
        }}
      >
        <div className="max-w-2xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide"
            style={{ borderColor: "var(--border)", color: "var(--accent)", backgroundColor: "var(--accent-light)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block" style={{ backgroundColor: "var(--accent)" }} />
            Moving marketplace — Denmark · Sweden · Norway
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-7"
            style={{ color: "var(--text-strong)" }}>
            Tell us about{" "}
            <span className="font-display italic font-light" style={{ color: "var(--primary)" }}>
              your move.
            </span>
            <br />
            We&apos;ll find{" "}
            <span className="font-display italic font-light">
              the right movers.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: "var(--text)" }}>
            A short conversation with our AI produces an anonymous brief. Trusted
            moving companies across Scandinavia compete for your job — you choose
            who to connect with.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/qualify"
              className="inline-flex items-center gap-2.5 font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-200 btn-press hover:opacity-90 active:scale-95 shadow-card-md"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Plan your move
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Takes about 3 minutes · No account needed
            </p>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center gap-5 mt-10 pt-10 border-t" style={{ borderColor: "var(--border-light)" }}>
            {[
              { icon: Shield,   label: "Anonymous bids" },
              { icon: PhoneOff, label: "No spam calls" },
              { icon: Tag,      label: "Free for homeowners" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: "var(--border-light)", backgroundColor: "white" }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-14" style={{ color: "var(--accent)" }}>
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step
              number="01"
              icon={<MessageSquare className="w-5 h-5" />}
              title="Describe your move"
              body="Chat with our AI — it asks smart questions about your origin, destination, floor access, special items, and timeline."
            />
            <Step
              number="02"
              icon={<FileText className="w-5 h-5" />}
              title="Receive anonymous bids"
              body="Matched moving companies receive your anonymous brief and submit competitive bids. You see their price — not their name."
            />
            <Step
              number="03"
              icon={<Users className="w-5 h-5" />}
              title="Choose and connect"
              body="Pick the bid you like. Both you and the mover exchange contact details. The deal happens between you directly."
            />
          </div>
        </div>
      </section>

      {/* ── Move types ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-10" style={{ color: "var(--text-muted)" }}>
          All move types
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Private homes",  icon: Home },
            { label: "Office moves",   icon: Building2 },
            { label: "Heavy items",    icon: Weight },
            { label: "International",  icon: Globe },
            { label: "Storage",        icon: Package },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border bg-white text-center transition-all duration-200 card-lift"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-strong)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Countries ────────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: "var(--border-light)", backgroundColor: "white" }}>
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="font-display text-xl italic mb-2" style={{ color: "var(--primary)" }}>
              Local expertise, Scandinavian scale.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Providers who know their local areas — narrow Copenhagen streets, Oslo
              hills, Stockholm staircases. Our AI adapts to your language:&nbsp;
              Danish, Swedish, Norwegian, or English.
            </p>
          </div>
          <div className="flex gap-10 shrink-0">
            {[
              { flag: "🇩🇰", name: "Denmark"  },
              { flag: "🇸🇪", name: "Sweden"   },
              { flag: "🇳🇴", name: "Norway"   },
            ].map(({ flag, name }) => (
              <div key={name} className="text-center">
                <div className="text-3xl mb-1.5">{flag}</div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-28 text-center">
        <h2 className="font-display text-4xl md:text-5xl mb-5" style={{ color: "var(--text-strong)" }}>
          Ready when you are.
        </h2>
        <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
          Takes about 3 minutes. No account. No spam.
        </p>
        <Link
          href="/qualify"
          className="inline-flex items-center gap-2.5 font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-200 btn-press hover:opacity-90 shadow-card-md"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Plan your move
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="font-display text-sm font-semibold" style={{ color: "var(--primary)" }}>
            LeadGen
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Mock POC · 2026
          </span>
        </div>
      </footer>

    </main>
  );
}

// ── Step component ─────────────────────────────────────────────────────────

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
      >
        {icon}
      </div>
      <p className="text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>{number}</p>
      <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-strong)" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{body}</p>
    </div>
  );
}
