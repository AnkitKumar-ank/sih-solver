import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/tiff", "text/csv", "application/json"];
const KEYWORDS = ["khasra", "khatauni", "jamabandi", "ror", "naksha", "mutation", "deed", "survey", "patta", "record"];

// Register an uploaded file (already in the "documents" bucket) as a document row.
export const registerDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { file_name: string; storage_path: string; mime_type: string; size_bytes: number }) => {
    if (!d || typeof d.file_name !== "string" || typeof d.storage_path !== "string" || typeof d.size_bytes !== "number")
      throw new Error("Invalid document");
    return { ...d, file_name: d.file_name.slice(0, 255), mime_type: String(d.mime_type ?? "").slice(0, 120) };
  })
  .handler(async ({ data, context }) => {
    if (!data.storage_path.startsWith(`${context.userId}/`)) throw new Error("Forbidden path");
    const { data: row, error } = await context.supabase
      .from("documents")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// Process a verification request: runs integrity/format/content checks,
// stores a verification result and a screening report.
export const processVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { document_id: string }) => {
    if (!d || typeof d.document_id !== "string") throw new Error("Invalid id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error } = await supabase
      .from("documents")
      .select("id,file_name,storage_path,mime_type,size_bytes")
      .eq("id", data.document_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) throw new Error("Document not found");

    await supabase.from("documents").update({ status: "processing" }).eq("id", doc.id);

    const checks: { name: string; passed: boolean; detail: string }[] = [];
    const { data: blob, error: dlErr } = await supabase.storage.from("documents").download(doc.storage_path);
    checks.push({ name: "File present in storage", passed: !dlErr && !!blob, detail: dlErr?.message ?? "Retrieved" });

    let hash = "";
    if (blob) {
      const buf = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buf);
      hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
      checks.push({ name: "Integrity hash (SHA-256)", passed: true, detail: hash.slice(0, 16) + "…" });
      checks.push({
        name: "Size matches upload",
        passed: buf.byteLength === Number(doc.size_bytes),
        detail: `${buf.byteLength} bytes`,
      });
    }
    checks.push({
      name: "Accepted file format",
      passed: ALLOWED.includes(doc.mime_type ?? ""),
      detail: doc.mime_type || "unknown",
    });
    checks.push({
      name: "Within size limit (20 MB)",
      passed: Number(doc.size_bytes) > 0 && Number(doc.size_bytes) <= 20 * 1024 * 1024,
      detail: `${Math.round(Number(doc.size_bytes) / 1024)} KB`,
    });
    const lower = doc.file_name.toLowerCase();
    const kw = KEYWORDS.find((k) => lower.includes(k));
    checks.push({
      name: "Land-record document type identified",
      passed: !!kw,
      detail: kw ? `Matched "${kw}"` : "No land-record keyword in file name",
    });
    const { count } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("file_name", doc.file_name)
      .eq("size_bytes", doc.size_bytes)
      .neq("id", doc.id);
    checks.push({
      name: "No duplicate submission",
      passed: !count,
      detail: count ? `${count} similar upload(s)` : "Unique",
    });

    const passed = checks.filter((c) => c.passed).length;
    const score = Math.round((passed / checks.length) * 100);
    const verdict = score >= 85 ? "verified" : score >= 60 ? "needs_review" : "rejected";
    const risk_level = verdict === "verified" ? "low" : verdict === "needs_review" ? "medium" : "high";
    const findings = checks.filter((c) => !c.passed).map((c) => `${c.name}: ${c.detail}`);
    const recommendation =
      verdict === "verified"
        ? "Document cleared for inclusion in the evidence base."
        : verdict === "needs_review"
          ? "Forward to a revenue official for manual review before use."
          : "Reject and request a corrected resubmission.";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: vr, error: vErr } = await supabaseAdmin
      .from("verification_results")
      .insert({ document_id: doc.id, user_id: userId, verdict, score, checks })
      .select("id")
      .single();
    if (vErr) throw new Error(vErr.message);
    const { error: rErr } = await supabaseAdmin.from("screening_reports").insert({
      document_id: doc.id,
      verification_id: vr.id,
      user_id: userId,
      risk_level,
      findings,
      recommendation,
    });
    if (rErr) throw new Error(rErr.message);
    await supabase.from("documents").update({ status: verdict }).eq("id", doc.id);

    return { verdict, score, risk_level, findings, recommendation };
  });

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("id,file_name,status,size_bytes,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const listMyScreeningReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("screening_reports")
      .select("id,document_id,risk_level,findings,recommendation,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });
