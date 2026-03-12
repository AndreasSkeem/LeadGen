import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-gray-900 tracking-tight">LeadFlow</span>
          <span className="text-sm text-gray-400">For movers</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-500 tracking-wide uppercase mb-4">
            Moving made simple
          </p>
          <h1 className="text-5xl font-light text-gray-900 leading-tight mb-6">
            Tell us about your move.{" "}
            <span className="font-semibold">We&apos;ll find the right movers.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-10">
            A short conversation with our AI gives you an anonymous brief. Trusted moving
            companies in Scandinavia bid on your job — you choose who to connect with.
          </p>
          <Link
            href="/qualify"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Plan your move
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step
              number="01"
              title="Describe your move"
              body="Chat with our AI — it asks smart questions about your move, floor level, special items, timeline, and preferences."
            />
            <Step
              number="02"
              title="Get matched bids"
              body="We match your anonymous brief with relevant moving companies. They compete for your job with their best offer."
            />
            <Step
              number="03"
              title="Choose and connect"
              body="Pick the bid you like. Both you and the mover get each other's contact details. That's when the deal happens."
            />
          </div>
        </div>
      </section>

      {/* Move types */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-12">
          We handle all move types
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Private homes", icon: "🏠" },
            { label: "Office moves", icon: "🏢" },
            { label: "Heavy items", icon: "🎹" },
            { label: "International", icon: "✈️" },
            { label: "Storage", icon: "📦" },
          ].map(({ label, icon }) => (
            <div
              key={label}
              className="border border-gray-200 rounded-lg p-5 text-center hover:border-brand-500 transition-colors"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-medium text-gray-700">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-gray-500 text-sm">
              Covering Denmark, Sweden, and Norway — with providers who know their local areas.
              Our AI adapts to your language: Danish, Swedish, Norwegian, or English.
            </p>
          </div>
          <div className="flex gap-8 text-center">
            {[
              { flag: "🇩🇰", name: "Denmark" },
              { flag: "🇸🇪", name: "Sweden" },
              { flag: "🇳🇴", name: "Norway" },
            ].map(({ flag, name }) => (
              <div key={name}>
                <div className="text-3xl mb-1">{flag}</div>
                <div className="text-xs text-gray-400">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-light text-gray-900 mb-4">
          Ready when you are.
        </h2>
        <p className="text-gray-500 mb-8">Takes about 3 minutes. No account needed.</p>
        <Link
          href="/qualify"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-8 py-4 rounded-lg transition-colors text-lg"
        >
          Plan your move
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-sm text-gray-400">LeadFlow</span>
          <span className="text-sm text-gray-300">Mock POC</span>
        </div>
      </footer>
    </main>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="text-xs font-mono text-brand-500 mb-3">{number}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
