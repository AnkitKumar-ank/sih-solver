import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Research Hub" },
  { to: "/datasets", label: "Datasets" },
  { to: "/policy-sandbox", label: "Policy Sandbox" },
  { to: "/library", label: "Archive" },
] as const;

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
    staleTime: 60_000,
  });
}

export function SiteHeader() {
  const { data: user } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <>
      {/* Top Govt Bar */}
      <div className="flex items-center justify-between bg-gov-navy px-4 py-1 text-[10px] font-medium tracking-wider text-white/90 uppercase md:px-8">
        <span>Ministry of Rural Development • Department of Land Resources</span>
        <div className="hidden gap-4 md:flex">
          <span>Digital India</span>
          <span>SIH 2026 · PS 26019</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gov-navy/10 bg-white px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-gov-navy font-serif text-xl text-white">
            B
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-gov-navy md:text-2xl">
            Bhu-Vigyan Portal
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-gov-navy lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-gov-gold [&.active]:border-b-2 [&.active]:border-gov-gold [&.active]:text-gov-gold"
              activeProps={{ className: "active" }}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="transition-colors hover:text-gov-gold [&.active]:border-b-2 [&.active]:border-gov-gold [&.active]:text-gov-gold"
                activeProps={{ className: "active" }}
              >
                My Workspace
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-sm border border-gov-navy/20 px-5 py-2 transition-colors hover:border-gov-gold hover:text-gov-gold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-sm bg-gov-navy px-5 py-2 text-white transition-colors hover:bg-gov-navy/90"
            >
              Official Login
            </Link>
          )}
        </div>
        {/* Mobile nav */}
        <div className="flex items-center gap-3 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-medium text-gov-navy/70 hover:text-gov-gold [&.active]:font-semibold [&.active]:text-gov-gold"
              activeProps={{ className: "active" }}
            >
              {item.label.split(" ")[0]}
            </Link>
          ))}
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="rounded-sm bg-gov-navy px-3 py-1.5 text-xs font-medium text-white"
          >
            {user ? "Workspace" : "Login"}
          </Link>
        </div>
      </nav>
    </>
  );
}
