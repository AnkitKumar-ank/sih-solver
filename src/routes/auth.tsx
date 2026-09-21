import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Official Login — Bhu-Vigyan" },
      {
        name: "description",
        content:
          "Sign in to the Bhu-Vigyan national land governance platform to save policy simulations and access restricted datasets.",
      },
      { property: "og:title", content: "Official Login — Bhu-Vigyan" },
      {
        property: "og:description",
        content: "Secure access for researchers and officials.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Account created. Check your email to confirm your address, then sign in.");
          setMode("signin");
        } else {
          navigate({ to: redirect });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return; // browser navigates away
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gov-slate font-sans text-gov-navy">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border border-gov-navy/10 bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-sm bg-gov-navy font-serif text-xl text-white">
              B
            </div>
            <div>
              <h1 className="font-serif text-2xl">
                {mode === "signin" ? "Official Login" : "Register Account"}
              </h1>
              <p className="text-xs text-gov-navy/50">
                Researchers & officials — Bhu-Vigyan Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mb-4 w-full border border-gov-navy/20 bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gov-slate disabled:opacity-50"
          >
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-[10px] font-bold tracking-widest text-gov-navy/40 uppercase">
            <span className="h-px flex-1 bg-gov-navy/10" />
            or with email
            <span className="h-px flex-1 bg-gov-navy/10" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-xs font-bold tracking-widest text-gov-gold uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gov-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold tracking-widest text-gov-gold uppercase">
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@department.gov.in"
                className="w-full border border-gov-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold tracking-widest text-gov-gold uppercase">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gov-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gov-gold focus:ring-1 focus:ring-gov-gold"
              />
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-gov-navy px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gov-navy/60">
            {mode === "signin" ? "New to the platform? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-gov-gold hover:underline"
            >
              {mode === "signin" ? "Register" : "Sign in"}
            </button>
          </p>
          <p className="mt-6 border-t border-gov-navy/10 pt-3 text-center text-[10px] text-gov-navy/40">
            Authorized access only. <Link to="/" className="hover:underline">Return to portal</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
