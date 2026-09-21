import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-gov-navy px-4 py-16 text-white/80 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-white font-serif text-lg text-gov-navy">
              B
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-white">
              Bhu-Vigyan
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            An initiative of DoLR to bridge the gap between academic research and land
            administration policy.
          </p>
        </div>
        <div>
          <h4 className="mb-6 text-xs font-bold tracking-widest text-white uppercase">
            Terminology
          </h4>
          <ul className="space-y-3 text-xs">
            <li>Khasra (Survey No.)</li>
            <li>Khatauni (RoR)</li>
            <li>Jamabandi (Registers)</li>
            <li>Cadastral Mapping</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 text-xs font-bold tracking-widest text-white uppercase">
            Innovation Lab
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <Link to="/policy-sandbox" className="hover:text-white">
                Sandbox Environment
              </Link>
            </li>
            <li>
              <Link to="/library" className="hover:text-white">
                Case Study Library
              </Link>
            </li>
            <li>
              <Link to="/datasets" className="hover:text-white">
                Dataset Catalog
              </Link>
            </li>
            <li>Methodology</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 text-xs font-bold tracking-widest text-white uppercase">
            State Portals
          </h4>
          <div className="flex flex-wrap gap-2">
            {["UP", "MH", "KA", "TN", "GJ", "WB", "RJ", "MP"].map((s) => (
              <span
                key={s}
                className="rounded-sm border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-medium tracking-widest"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-8 text-[10px] font-medium tracking-wide uppercase md:flex-row md:items-center">
        <span>© 2026 Department of Land Resources. All Rights Reserved.</span>
        <div className="flex gap-6">
          <span>Accessibility</span>
          <span>Privacy Policy</span>
          <span>Contact Nodal Officer</span>
        </div>
      </div>
    </footer>
  );
}
