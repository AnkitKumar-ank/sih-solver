import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, storage: undefined, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// ---------- Public catalog reads ----------

export const listDatasets = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("datasets")
    .select("code,name,category,state,volume,updated_label,access")
    .order("code");
  if (error) throw new Error(error.message);
  return data;
});

export const listPapers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("papers")
    .select("id,title,authors,date_label,topic,summary,citations")
    .order("citations", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});

// ---------- Authenticated: saved Policy Sandbox simulations ----------

type SimulationInput = {
  state_name: string;
  ceiling_ha: number;
  digitization_target: number;
  compensation_multiplier: number;
  results: Record<string, string>;
};

export const saveSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SimulationInput) => {
    if (
      !data ||
      typeof data.state_name !== "string" ||
      typeof data.ceiling_ha !== "number" ||
      typeof data.digitization_target !== "number" ||
      typeof data.compensation_multiplier !== "number" ||
      typeof data.results !== "object"
    ) {
      throw new Error("Invalid simulation payload");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("simulations").insert({
      user_id: context.userId,
      state_name: data.state_name,
      ceiling_ha: data.ceiling_ha,
      digitization_target: data.digitization_target,
      compensation_multiplier: data.compensation_multiplier,
      results: data.results,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMySimulations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("simulations")
      .select("id,state_name,ceiling_ha,digitization_target,compensation_multiplier,results,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!data || typeof data.id !== "string") throw new Error("Invalid id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("simulations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("full_name,organization,designation")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { full_name: string; organization: string; designation: string }) => {
    if (!data || typeof data.full_name !== "string") throw new Error("Invalid profile");
    return {
      full_name: data.full_name.slice(0, 120),
      organization: String(data.organization ?? "").slice(0, 160),
      designation: String(data.designation ?? "").slice(0, 120),
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
