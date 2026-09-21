import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Research Archive — Bhu-Vigyan" },
      {
        name: "description",
        content:
          "Peer-reviewed research, case studies and policy briefs on land governance in India: SVAMITVA outcomes, tenancy reforms, cadastral digitization and dispute resolution.",
      },
      { property: "og:title", content: "Research Archive — Bhu-Vigyan" },
      {
        property: "og:description",
        content: "Peer-reviewed research and policy briefs on Indian land governance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

type Paper = {
  title: string;
  authors: string;
  date: string;
  topic: string;
  summary: string;
  citations: number;
};

const PAPERS: Paper[] = [
  {
    title: "Impact of SVAMITVA Scheme on Collateralization of Abadi Land",
    authors: "Dr. Ananya Iyer · Dept of Rural Development",
    date: "Aug 2026",
    topic: "Socio-Economic Study",
    summary:
      "An empirical analysis of credit flow to rural households after the issuance of digital property cards across 12,000 villages in Uttar Pradesh and Haryana.",
    citations: 47,
  },
  {
    title: "Standardizing Bhunaksha Protocols for Cross-State Interoperability",
    authors: "Rohan Deshmukh · Land Governance Fellow",
    date: "Jul 2026",
    topic: "Technical Review",
    summary:
      "Evaluating the progress of the Unified Land Information System (ULIP) in harmonizing diverse cadastral mapping standards across western states.",
    citations: 32,
  },
  {
    title: "Tenancy Informality and the Model Tenancy Act: Evidence from Telangana",
    authors: "Dr. Kavya Reddy · CESS Hyderabad",
    date: "Jun 2026",
    topic: "Policy Brief",
    summary:
      "Field survey of 4,800 sharecropping households suggesting formal registration could raise tenant investment in land improvement by 18–24%.",
    citations: 58,
  },
  {
    title: "Satellite Ground-Truthing of Record of Rights: A Karnataka Audit",
    authors: "MoRD Assessment Cell · DoLR",
    date: "May 2026",
    topic: "Geospatial Audit",
    summary:
      "Comparing 1.2M digitized RoR entries against high-resolution satellite parcels; mismatch rate of 3.7% concentrated in older survey settlements.",
    citations: 21,
  },
  {
    title: "Land Dispute Litigation: Causes, Duration, and Digital Remedies",
    authors: "Dr. S. Bhattacharya · NLU Delhi",
    date: "Apr 2026",
    topic: "Legal Study",
    summary:
      "Analysis of 3.3M land cases showing that districts with complete digitization dispose of title disputes 31% faster on average.",
    citations: 89,
  },
  {
    title: "Forest Rights Act Claims: Digitizing the Community Rights Ledger",
    authors: "Meera Vasquez · Tribal Research Institute, Odisha",
    date: "Mar 2026",
    topic: "Policy Brief",
    summary:
      "Recommendations for a federated claims registry linking FRA record rooms with state land records for 610K pending claims.",
    citations: 27,
  },
];

const TOPICS = ["All", "Socio-Economic Study", "Technical Review", "Policy Brief", "Geospatial Audit", "Legal Study"] as const;

function LibraryPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");

  const filtered = useMemo(
    () => PAPERS.filter((p) => topic === "All" || p.topic === topic),
    [topic],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <h1 className="font-serif text-4xl md:text-5xl">Research Archive</h1>
              <p className="max-w-sm text-gov-navy/60">
                Peer-reviewed insights into the socioeconomic impact of land record
                modernization in rural India.
              </p>
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-gov-gold uppercase">
                  Filter by Topic
                </h3>
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                      topic === t
                        ? "border border-gov-navy/10 bg-white font-semibold"
                        : "text-gov-navy/60 hover:bg-white"
                    }`}
                  >
                    {t === "All" ? "All Publications" : t}
                  </button>
                ))}
              </div>
              <div className="rounded-sm border border-gov-navy/10 bg-gov-navy/5 p-4">
                <h4 className="mb-2 text-xs font-bold">Submit Research</h4>
                <p className="mb-3 text-[11px] leading-tight text-gov-navy/60">
                  Affiliated researchers can submit working papers and policy briefs for
                  departmental review.
                </p>
                <button className="text-[11px] font-bold text-gov-gold uppercase hover:underline">
                  Start Submission →
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-col divide-y divide-gov-navy/10">
              {filtered.map((p) => (
                <article key={p.title} className="group cursor-pointer py-10 first:pt-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gov-navy/40">{p.date}</span>
                      <span className="size-1 rounded-full bg-gov-navy/20" />
                      <span className="text-xs font-medium text-gov-gold">{p.topic}</span>
                      <span className="ml-auto text-[10px] text-gov-navy/40">
                        {p.citations} citations
                      </span>
                    </div>
                    <h2 className="max-w-[35ch] font-serif text-2xl transition-colors group-hover:text-gov-gold md:text-3xl">
                      {p.title}
                    </h2>
                    <p className="max-w-[56ch] text-sm text-gov-navy/70">{p.summary}</p>
                    <span className="text-xs font-medium text-gov-navy/50">{p.authors}</span>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <p className="py-16 text-center text-sm text-gov-navy/50">
                  No publications in this topic yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
