import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import indiaTerrain from "@/assets/india-terrain.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Bhu-Vigyan — National Land Governance Research Platform",
      },
      {
        name: "description",
        content:
          "A national digital platform for research, policy innovation, and evidence-based land governance. Analyze cadastral records, simulate land reforms, and access verified geospatial datasets.",
      },
      { property: "og:title", content: "Bhu-Vigyan — National Land Governance Research Platform" },
      {
        property: "og:description",
        content:
          "The unified national platform for researchers and policy innovators working on India's land resources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const modules = [
  {
    tag: "Policy Simulation",
    tagClass: "bg-blue-50 text-blue-700",
    updated: "Last updated 2h ago",
    title: "UP Land Ceiling Impact Study",
    desc: "Scenario A-42: Modeling the fragmentation impact of revised land ceiling limits in Western UP districts.",
    avatars: ["Dr. S", "J.K."],
    meta: "3 Active Researchers",
  },
  {
    tag: "Geospatial Analysis",
    tagClass: "bg-amber-50 text-amber-700",
    updated: "Public Access",
    title: "Khasra Digitization Audit",
    desc: "National comparison of Record of Rights (RoR) accuracy vs satellite ground-truthing in Karnataka.",
    avatars: ["MoRD"],
    meta: "Departmental Report",
  },
  {
    tag: "Draft Policy",
    tagClass: "bg-emerald-50 text-emerald-700",
    updated: "Drafting stage",
    title: "Tenancy Recognition Framework",
    desc: "Legal blueprint for digitizing informal sharecropping arrangements under the new Model Tenancy Act.",
    avatars: ["Law"],
    meta: "Legal Cell Review",
  },
] as const;

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8">
        {/* Hero Section */}
        <div className="mb-20 grid grid-cols-1 items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h1 className="mb-6 font-serif text-5xl leading-[1.1] md:text-6xl">
              Evidence-Based <span className="italic text-gov-gold">Governance</span> for
              India's Land Resources.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gov-navy/70">
              The unified national platform for researchers and policy innovators to analyze
              cadastral records, simulate land reforms, and access verified geospatial datasets.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/policy-sandbox"
                className="flex items-center gap-2 bg-gov-navy px-8 py-4 font-medium text-white transition-all hover:shadow-xl"
              >
                Launch Policy Sandbox
              </Link>
              <Link
                to="/library"
                className="border border-gov-navy/20 px-8 py-4 font-medium transition-colors hover:bg-white"
              >
                Explore Land Library
              </Link>
            </div>
          </div>
          <div className="relative md:col-span-5">
            <div className="grid w-full place-items-center overflow-hidden rounded-lg border border-gov-navy/5 bg-white shadow-2xl">
              <img
                src={indiaTerrain}
                alt="3D topographic map of India with gold data overlays"
                width={1024}
                height={768}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="relative mt-4 bg-gov-gold p-6 text-white shadow-lg md:absolute md:-bottom-6 md:-left-6 md:mt-0">
              <div className="font-serif text-3xl">98.4%</div>
              <div className="text-[10px] font-bold tracking-widest uppercase">
                RoR Digitized Across India
              </div>
            </div>
          </div>
        </div>

        {/* Research Workspace Area */}
        <div className="flex flex-col gap-10 border-t border-gov-navy/10 pt-16 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full shrink-0 space-y-8 lg:w-64">
            <div>
              <h3 className="mb-4 text-xs font-bold tracking-widest text-gov-gold uppercase">
                Research Focus
              </h3>
              <div className="space-y-2">
                {["Tenancy Reforms", "Tribal Land Rights", "Land Conversion Stats"].map(
                  (f, i) => (
                    <label
                      key={f}
                      className={`flex cursor-pointer items-center gap-3 rounded p-2 text-sm ${
                        i === 0 ? "border border-gov-navy/5 bg-white" : "transition-colors hover:bg-white"
                      }`}
                    >
                      <div className="size-4 rounded-sm border border-gov-navy/30"></div>
                      {f}
                    </label>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-sm border border-gov-navy/10 bg-gov-navy/5 p-4">
              <h4 className="mb-2 text-xs font-bold">Dataset Catalog</h4>
              <p className="mb-4 text-[11px] leading-tight text-gov-navy/60">
                Access 40+ TB of geospatial and textual land records including Khasra and
                Khatauni data.
              </p>
              <Link
                to="/datasets"
                className="text-[11px] font-bold text-gov-gold uppercase hover:underline"
              >
                Browse 2,401 Sets →
              </Link>
            </div>
          </aside>

          {/* Main Content Grid */}
          <div className="flex-1">
            <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
              <div>
                <h2 className="mb-1 font-serif text-3xl">Active Research Modules</h2>
                <p className="text-sm text-gov-navy/50">
                  Showing latest innovation briefs and policy simulations
                </p>
              </div>
              <div className="flex overflow-hidden rounded-sm border border-gov-navy/20 text-[10px] font-bold tracking-widest uppercase">
                <button className="bg-gov-navy px-4 py-2 text-white">Grid</button>
                <button className="bg-white px-4 py-2 hover:bg-gov-navy/5">List</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {modules.map((m) => (
                <div
                  key={m.title}
                  className="group cursor-pointer border border-gov-navy/5 bg-white p-6 transition-all hover:border-gov-gold/50"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <div
                      className={`rounded px-2 py-1 text-[9px] font-bold tracking-tighter uppercase ${m.tagClass}`}
                    >
                      {m.tag}
                    </div>
                    <span className="text-[10px] font-medium text-gov-navy/40 italic">
                      {m.updated}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-medium transition-colors group-hover:text-gov-gold">
                    {m.title}
                  </h3>
                  <p className="mb-6 text-sm text-gov-navy/70">{m.desc}</p>
                  <div className="flex items-center gap-4 border-t border-gov-navy/5 pt-4">
                    <div className="flex -space-x-2">
                      {m.avatars.map((a) => (
                        <div
                          key={a}
                          className="grid size-6 place-items-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold"
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-gov-navy/50">{m.meta}</span>
                  </div>
                </div>
              ))}

              {/* Card 4 — start new simulation */}
              <Link
                to="/policy-sandbox"
                className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gov-navy/10 bg-white/50 p-6 transition-colors hover:bg-gov-navy/5"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-gov-navy/20 transition-colors group-hover:border-gov-gold">
                  <span className="text-2xl font-light text-gov-navy/40">+</span>
                </div>
                <span className="text-sm font-bold text-gov-navy/60">Start New Simulation</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
