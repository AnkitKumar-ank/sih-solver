import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  listMySimulations,
  deleteSimulation,
  getMyProfile,
  updateMyProfile,
} from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Workspace — Bhu-Vigyan" },
      {
        name: "description",
        content:
          "Your saved policy simulations, profile, and uploaded research documents on the Bhu-Vigyan platform.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const fetchSimulations = useServerFn(listMySimulations);
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const removeSimulation = useServerFn(deleteSimulation);

  const { data: simulations = [], isLoading: simsLoading } = useQuery({
    queryKey: ["my-simulations"],
    queryFn: () => fetchSimulations(),
  });
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => removeSimulation({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-simulations"] }),
  });

  // Profile form
  const [fullName, setFullName] = useState<string | null>(null);
  const [organization, setOrganization] = useState<string | null>(null);
  const [designation, setDesignation] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Documents
  const fileInput = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<{ name: string }[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  async function loadDocs() {
    const { data } = await supabase.storage.from("documents").list(user.id);
    setDocs((data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder"));
    setDocsLoaded(true);
  }
  if (!docsLoaded) void loadDocs();

  async function handleUpload(file: File) {
    setUploadMsg(null);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (error) {
      setUploadMsg(`Upload failed: ${error.message}`);
      return;
    }
    try {
      setUploadMsg("Document uploaded. Running verification…");
      const doc = await registerDoc({
        data: { file_name: file.name, storage_path: path, mime_type: file.type, size_bytes: file.size },
      });
      const r = await verifyDoc({ data: { document_id: doc.id } });
      setUploadMsg(`Verification: ${r.verdict.replace("_", " ")} (score ${r.score}/100, ${r.risk_level} risk).`);
    } catch (e) {
      setUploadMsg(`Uploaded, but verification failed: ${e instanceof Error ? e.message : "error"}`);
    }
    void loadDocs();
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-2 font-serif text-4xl md:text-5xl">My Workspace</h1>
            <p className="text-gov-navy/60">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-sm border border-gov-navy/20 px-5 py-2 text-sm font-medium transition-colors hover:border-gov-gold hover:text-gov-gold"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Saved simulations */}
          <section className="lg:col-span-7">
            <div className="border border-gov-navy/10 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl">Saved Policy Scenarios</h2>
                <Link
                  to="/policy-sandbox"
                  className="text-xs font-bold tracking-widest text-gov-gold uppercase hover:underline"
                >
                  New Scenario →
                </Link>
              </div>
              {simsLoading ? (
                <p className="py-8 text-center text-sm text-gov-navy/50">Loading…</p>
              ) : simulations.length === 0 ? (
                <p className="py-8 text-center text-sm text-gov-navy/50">
                  No saved scenarios yet. Open the{" "}
                  <Link to="/policy-sandbox" className="text-gov-gold hover:underline">
                    Policy Sandbox
                  </Link>{" "}
                  and save your first simulation.
                </p>
              ) : (
                <ul className="divide-y divide-gov-navy/5">
                  {simulations.map((s) => (
                    <li key={s.id} className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-semibold">{s.state_name}</p>
                        <p className="mt-0.5 text-xs text-gov-navy/60">
                          Ceiling {String(s.ceiling_ha)} ha · Digitization{" "}
                          {s.digitization_target}% · Compensation ×
                          {String(s.compensation_multiplier)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gov-navy/40">
                          {new Date(s.created_at).toLocaleString("en-IN")} · Dispute reduction −
                          {(s.results as Record<string, string>).disputeReduction}% · Outlay{" "}
                          {(s.results as Record<string, string>).cost}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMut.mutate(s.id)}
                        className="shrink-0 text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="space-y-8 lg:col-span-5">
            {/* Profile */}
            <section className="border border-gov-navy/10 bg-white p-6">
              <h2 className="mb-4 font-serif text-2xl">Profile</h2>
              <div className="space-y-3">
                {(
                  [
                    ["Full Name", fullName ?? profile?.full_name ?? "", setFullName],
                    ["Organization", organization ?? profile?.organization ?? "", setOrganization],
                    ["Designation", designation ?? profile?.designation ?? "", setDesignation],
                  ] as const
                ).map(([label, value, set]) => (
                  <div key={label}>
                    <label className="mb-1 block text-[10px] font-bold tracking-widest text-gov-gold uppercase">
                      {label}
                    </label>
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="w-full border border-gov-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
                    />
                  </div>
                ))}
                {profileMsg && <p className="text-xs text-emerald-700">{profileMsg}</p>}
                <button
                  onClick={async () => {
                    await saveProfile({
                      data: {
                        full_name: fullName ?? profile?.full_name ?? "",
                        organization: organization ?? profile?.organization ?? "",
                        designation: designation ?? profile?.designation ?? "",
                      },
                    });
                    setProfileMsg("Profile saved.");
                    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
                  }}
                  className="w-full bg-gov-navy px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </section>

            {/* Documents */}
            <section className="border border-gov-navy/10 bg-white p-6">
              <h2 className="mb-1 font-serif text-2xl">Research Documents</h2>
              <p className="mb-4 text-xs text-gov-navy/50">
                Private upload area (max 20 MB per file) — only you can access these.
              </p>
              <input
                ref={fileInput}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInput.current?.click()}
                className="mb-4 w-full border border-dashed border-gov-navy/30 px-4 py-6 text-sm text-gov-navy/60 transition-colors hover:border-gov-gold hover:text-gov-gold"
              >
                Upload a document
              </button>
              {uploadMsg && <p className="mb-3 text-xs text-gov-navy/70">{uploadMsg}</p>}
              {docs.length > 0 && (
                <ul className="space-y-1 text-xs text-gov-navy/70">
                  {docs.map((d) => (
                    <li key={d.name} className="truncate border-b border-gov-navy/5 pb-1">
                      {d.name.replace(/^\d+-/, "")}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
