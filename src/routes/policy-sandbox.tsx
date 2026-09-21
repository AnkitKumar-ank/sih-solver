import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/policy-sandbox")({
  head: () => ({
    meta: [
      { title: "Policy Sandbox — Bhu-Vigyan" },
      {
        name: "description",
        content:
          "Simulate land reform scenarios: model land ceiling revisions, digitization targets, and compensation policy against state-level data before drafting legislation.",
      },
      { property: "og:title", content: "Policy Sandbox — Bhu-Vigyan" },
      {
        property: "og:description",
        content: "Evidence-based simulation of land policy scenarios across Indian states.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PolicySandboxPage,
});

const STATES = [
  { name: "Uttar Pradesh", holdings: 23.3, surplus: 4.2, disputes: 61 },
  { name: "Bihar", holdings: 16.1, surplus: 6.8, disputes: 74 },
  { name: "Maharashtra", holdings: 13.7, surplus: 2.9, disputes: 48 },
  { name: "Karnataka", holdings: 8.4, surplus: 3.1, disputes: 39 },
  { name: "Rajasthan", holdings: 10.9, surplus: 5.4, disputes: 52 },
] as const;

function formatINR(crores: number) {
  if (crores >= 100000) return `₹${(crores / 100000).toFixed(2)} L Cr`;
  if (crores >= 1000) return `₹${(crores / 1000).toFixed(1)}K Cr`;
  return `₹${crores.toFixed(0)} Cr`;
}

function PolicySandboxPage() {
  const [state, setState] = useState<string>("Uttar Pradesh");
  const [ceiling, setCeiling] = useState(12.5);
  const [digitization, setDigitization] = useState(90);
  const [compensation, setCompensation] = useState(2.0);

  const s = STATES.find((x) => x.name === state)!;

  const results = useMemo(() => {
    // Demo simulation formulas (prototype heuristics, not real models)
    const excessPerHolding = Math.max(0, s.holdings - ceiling);
    const affected = Math.round(s.holdings * 1e6 * (excessPerHolding / s.holdings) * 0.08);
    const surplusRedistributed = (excessPerHolding / s.holdings) * s.surplus * 1e5;
    const cost = affected * compensation * 4.2;
    const disputeReduction = Math.min(
      40,
      (digitization / 100) * 22 + (compensation / 2) * 6 + (excessPerHolding > 0 ? 4 : 0),
    );
    const titleClarity = Math.min(99, digitization + disputeReduction / 2);
    return {
      affected: affected.toLocaleString("en-IN"),
      surplusRedistributed: surplusRedistributed.toFixed(0),
      cost: formatINR(cost),
      disputeReduction: disputeReduction.toFixed(1),
      titleClarity: titleClarity.toFixed(1),
      confidence: digitization > 85 ? "High" : digitization > 70 ? "Medium" : "Low",
    };
  }, [s, ceiling, digitization, compensation]);

  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-sm bg-amber-50 px-2 py-1 text-[9px] font-bold tracking-tighter text-amber-700 uppercase">
            Beta · Simulation Environment
          </div>
          <h1 className="mb-2 font-serif text-4xl md:text-5xl">Policy Sandbox</h1>
          <p className="max-w-2xl text-gov-navy/60">
            Draft a scenario, adjust policy levers, and see projected evidence-based outcomes
            before legislation is tabled. All figures are simulated for demonstration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-5">
            <div className="border border-gov-navy/10 bg-white p-6">
              <h2 className="mb-1 font-serif text-2xl">Scenario Parameters</h2>
              <p className="mb-6 text-xs text-gov-navy/50">Scenario ID: SIM-2026-0193 (Draft)</p>

              <label className="mb-2 block text-xs font-bold tracking-widest text-gov-gold uppercase">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mb-6 w-full border border-gov-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
              >
                {STATES.map((x) => (
                  <option key={x.name}>{x.name}</option>
                ))}
              </select>

              {[
                {
                  label: "Land Ceiling Limit",
                  unit: "ha",
                  min: 4,
                  max: 24,
                  step: 0.5,
                  value: ceiling,
                  set: setCeiling,
                  note: "Current national average: ~12.5 ha (irrigated)",
                },
                {
                  label: "RoR Digitization Target",
                  unit: "%",
                  min: 50,
                  max: 100,
                  step: 1,
                  value: digitization,
                  set: setDigitization,
                  note: "98.4% already digitized nationally",
                },
                {
                  label: "Compensation Multiplier",
                  unit: "×",
                  min: 1,
                  max: 4,
                  step: 0.1,
                  value: compensation,
                  set: setCompensation,
                  note: "LARR 2013 baseline: 2.0× market value",
                },
              ].map((p) => (
                <div key={p.label} className="mb-6">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{p.label}</span>
                    <span className="font-mono text-sm font-bold text-gov-gold">
                      {p.value}
                      {p.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={p.value}
                    onChange={(e) => p.set(Number(e.target.value))}
                    className="w-full accent-gov-gold"
                  />
                  <p className="mt-1 text-[10px] text-gov-navy/50">{p.note}</p>
                </div>
              ))}

              <button className="w-full bg-gov-navy px-8 py-3.5 font-medium text-white transition-all hover:shadow-xl">
                Run Simulation
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-7">
            <div className="border border-gov-navy/10 bg-white p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-2xl">Projected Outcomes · {state}</h2>
                <span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-bold tracking-tighter text-blue-700 uppercase">
                  Confidence: {results.confidence}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Holdings Affected", value: results.affected, sub: "landowners above new ceiling" },
                  { label: "Surplus Redistributed", value: `${results.surplusRedistributed} ha`, sub: "available for landless households" },
                  { label: "Compensation Outlay", value: results.cost, sub: "one-time government cost" },
                  { label: "Dispute Load Reduction", value: `−${results.disputeReduction}%`, sub: "projected over 5 years" },
                  { label: "Title Clarity Index", value: `${results.titleClarity}/100`, sub: "composite of digitization + surveys" },
                  { label: "Implementation Window", value: "18–30 mo", sub: "district rollout estimate" },
                ].map((r) => (
                  <div key={r.label} className="border border-gov-navy/5 bg-gov-slate p-4">
                    <div className="text-[10px] font-bold tracking-widest text-gov-navy/50 uppercase">
                      {r.label}
                    </div>
                    <div className="mt-1 font-serif text-2xl text-gov-navy">{r.value}</div>
                    <div className="mt-1 text-[10px] text-gov-navy/50">{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gov-navy/10 bg-white p-6">
              <h3 className="mb-4 text-sm font-bold tracking-widest text-gov-gold uppercase">
                Evidence Basis
              </h3>
              <ul className="space-y-3 text-sm text-gov-navy/70">
                <li className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gov-gold" />
                  Khasra survey records, {state} — 48M+ digitized entries (DS-1042)
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gov-gold" />
                  Agri land-use classification, Sentinel-2 composite (DS-0765)
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gov-gold" />
                  Land dispute litigation caseload, district courts (DS-1256)
                </li>
              </ul>
              <p className="mt-6 border-t border-gov-navy/5 pt-4 text-[10px] italic text-gov-navy/40">
                Prototype simulation with heuristic demo formulas — production version would run
                calibrated econometric models on the platform's verified datasets.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
