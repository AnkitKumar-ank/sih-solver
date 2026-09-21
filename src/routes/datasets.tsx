import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Dataset Catalog — Bhu-Vigyan" },
      {
        name: "description",
        content:
          "Browse 2,400+ verified geospatial and textual land governance datasets: cadastral maps, RoR records, land use, tenancy and digitization coverage across Indian states.",
      },
      { property: "og:title", content: "Dataset Catalog — Bhu-Vigyan" },
      {
        property: "og:description",
        content: "Verified national land governance datasets for research and policy analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DatasetsPage,
});

type Dataset = {
  id: string;
  name: string;
  category: string;
  state: string;
  records: string;
  updated: string;
  access: "Open" | "Restricted" | "Embargoed";
};

const DATASETS: Dataset[] = [
  { id: "DS-1042", name: "Khasra Survey Records (Village Level)", category: "Cadastral", state: "Uttar Pradesh", records: "48.2M", updated: "Sep 2026", access: "Restricted" },
  { id: "DS-0987", name: "Record of Rights (Khatauni) Digitized Register", category: "Records", state: "Bihar", records: "31.6M", updated: "Aug 2026", access: "Open" },
  { id: "DS-1103", name: "Bhu-Naksha Cadastral Map Tiles", category: "Cadastral", state: "Maharashtra", records: "2.1M maps", updated: "Sep 2026", access: "Open" },
  { id: "DS-0765", name: "Agricultural Land Use Classification (Sentinel-2)", category: "Geospatial", state: "All India", records: "40 TB", updated: "Sep 2026", access: "Open" },
  { id: "DS-0512", name: "Tenancy & Sharecropping Survey (NSS 79th Round)", category: "Socio-Economic", state: "All India", records: "112K hh", updated: "Jul 2026", access: "Embargoed" },
  { id: "DS-1330", name: "SVAMITVA Property Card Issuance Log", category: "Records", state: "Madhya Pradesh", records: "6.4M", updated: "Sep 2026", access: "Open" },
  { id: "DS-0871", name: "Land Acquisition & Compensation Awards", category: "Legal", state: "Rajasthan", records: "890K", updated: "Jun 2026", access: "Restricted" },
  { id: "DS-1199", name: "Jamabandi Registers (Historical 1980–2020)", category: "Records", state: "Haryana", records: "14.8M", updated: "May 2026", access: "Restricted" },
  { id: "DS-0954", name: "Tribal Land Rights (FRA) Claims Tracker", category: "Legal", state: "Odisha", records: "610K", updated: "Aug 2026", access: "Open" },
  { id: "DS-1408", name: "Urban Land Conversion & Zoning Changes", category: "Geospatial", state: "Karnataka", records: "340K", updated: "Sep 2026", access: "Restricted" },
  { id: "DS-0688", name: "Consolidation of Holdings Progress", category: "Socio-Economic", state: "Punjab", records: "2.9M", updated: "Apr 2026", access: "Open" },
  { id: "DS-1256", name: "Litigation Caseload — Land Disputes (Courts)", category: "Legal", state: "All India", records: "3.3M cases", updated: "Sep 2026", access: "Embargoed" },
];

const CATEGORIES = ["All", "Cadastral", "Records", "Geospatial", "Socio-Economic", "Legal"] as const;

const accessBadge: Record<Dataset["access"], string> = {
  Open: "bg-emerald-50 text-emerald-700",
  Restricted: "bg-blue-50 text-blue-700",
  Embargoed: "bg-amber-50 text-amber-700",
};

function DatasetsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATASETS.filter((d) => {
      const matchesCat = category === "All" || d.category === category;
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8">
        <div className="mb-10">
          <h1 className="mb-2 font-serif text-4xl md:text-5xl">Dataset Catalog</h1>
          <p className="max-w-2xl text-gov-navy/60">
            2,401 curated sets of geospatial and textual land records. Filter by category or
            search by state, survey number, or dataset ID.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Khasra, Village, State, or Dataset ID…"
            className="h-12 w-full max-w-md border border-gov-navy/15 bg-white px-4 text-sm outline-none transition-all focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === c
                    ? "border-gov-navy bg-gov-navy text-white"
                    : "border-gov-navy/20 bg-white text-gov-navy/70 hover:border-gov-gold/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-gov-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-gov-navy/10 bg-gov-slate">
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">ID</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">Dataset</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">State</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">Volume</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">Updated</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold tracking-widest text-gov-navy/60 uppercase">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-navy/5">
              {filtered.map((d) => (
                <tr key={d.id} className="group transition-colors hover:bg-gov-slate">
                  <td className="px-4 py-3.5 font-mono text-xs text-gov-navy/50">{d.id}</td>
                  <td className="px-4 py-3.5 text-sm font-medium transition-colors group-hover:text-gov-gold">
                    {d.name}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gov-navy/70">{d.category}</td>
                  <td className="px-4 py-3.5 text-xs text-gov-navy/70">{d.state}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gov-navy/70">{d.records}</td>
                  <td className="px-4 py-3.5 text-xs text-gov-navy/50">{d.updated}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`rounded px-2 py-1 text-[9px] font-bold tracking-tighter uppercase ${accessBadge[d.access]}`}>
                      {d.access}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-gov-navy/50">
                    No datasets match your search. Try a different state or category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gov-navy/50">
          Showing {filtered.length} of {DATASETS.length} sample datasets (of 2,401 in the full catalog).
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
