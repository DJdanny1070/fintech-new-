import { supabase } from "./supabase";

/* ══════════════════════════════════════════════════════════════
   serviceRequestService.js
   CresoX — Service Request Backend
   Table: service_requests
   ══════════════════════════════════════════════════════════════ */

const TABLE = "service_requests";
const BUCKET = "service-request-docs";

/* ─── Allowed file types for document uploads ─────────────── */
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/* ─── Validation helpers ──────────────────────────────────── */

/**
 * Validate a single file: type + size.
 * Returns null if valid, or a string error message.
 */
export function validateFile(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported file type. Allowed: PDF, JPG, PNG, DOC, DOCX.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit.`;
  }
  return null;
}

/**
 * Validate an array of files.
 * Returns an array of error strings (empty if all valid).
 */
export function validateFiles(files) {
  const errors = [];
  for (const file of files) {
    const err = validateFile(file);
    if (err) errors.push(err);
  }
  return errors;
}

/* ─── createRequest ───────────────────────────────────────── */

/**
 * Create a new service request row.
 *
 * Duplicate guard: if the same email already has a "pending" request
 * of the same type, this throws with a user-friendly message.
 *
 * @param {{
 *   request_type: 'asset_tokenization' | 'consultancy',
 *   full_name: string,
 *   company_name?: string,
 *   email: string,
 *   phone: string,
 *   business_type?: string,
 *   asset_type?: string,
 *   description: string,
 *   documents?: string[],   // array of public storage URLs
 *   metadata?: object,      // any extra fields stored as JSON
 * }} payload
 * @returns {Promise<object>} The created row.
 */
export async function createRequest(payload) {
  const {
    request_type,
    full_name,
    company_name = "",
    email,
    phone,
    business_type = "",
    asset_type = "",
    description,
    documents = [],
    metadata = {},
  } = payload;

  /* ── Duplicate-pending guard ── */
  const { data: existing, error: checkError } = await supabase
    .from(TABLE)
    .select("id, status")
    .eq("email", email.trim().toLowerCase())
    .eq("request_type", request_type)
    .eq("status", "pending")
    .maybeSingle();

  if (checkError) throw new Error("Could not verify existing requests. Please try again.");

  if (existing) {
    throw new Error(
      "You already have a pending request of this type. " +
      "Our team is reviewing it and will reach out soon. " +
      "You cannot submit a duplicate request while one is pending."
    );
  }

  /* ── Insert ── */
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        request_type,
        full_name: full_name.trim(),
        company_name: company_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        business_type: business_type.trim(),
        asset_type: asset_type.trim(),
        description: description.trim(),
        documents,
        status: "pending",
        metadata,
      },
    ])
    .select()
    .single();

  if (error) {
    /* Supabase unique constraint error code */
    if (error.code === "23505") {
      throw new Error(
        "A request with this email is already pending. Our team will contact you soon."
      );
    }
    throw new Error(error.message || "Failed to submit request. Please try again.");
  }

  return data;
}

/* ─── uploadDocuments ─────────────────────────────────────── */

/**
 * Upload one or more files to Supabase Storage.
 * Returns an array of public URLs.
 *
 * @param {File[]} files
 * @param {string} requestId  — used to namespace files in storage
 * @param {string} email      — used to namespace files in storage
 * @returns {Promise<string[]>} Public URLs of the uploaded files.
 */
export async function uploadDocuments(files, requestId, email) {
  if (!files || files.length === 0) return [];

  /* Validate all files before uploading any */
  const validationErrors = validateFiles(files);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join("\n"));
  }

  const urls = [];
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, "_");

  for (const file of files) {
    const ext = file.name.split(".").pop().toLowerCase();
    const timestamp = Date.now();
    const path = `${sanitizedEmail}/${requestId}/${timestamp}_${file.name.replace(/\s+/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload "${file.name}": ${uploadError.message}`
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    urls.push(urlData.publicUrl);
  }

  return urls;
}

/**
 * Update the documents column of an existing request.
 * Called after uploadDocuments to attach the URLs.
 */
export async function attachDocumentsToRequest(requestId, documentUrls) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ documents: documentUrls, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to attach documents.");
  return data;
}

/* ─── getRequestStatus ────────────────────────────────────── */

/**
 * Get the status of a specific request by ID.
 * @param {string} requestId
 * @returns {Promise<{ status: string, request_type: string, created_at: string } | null>}
 */
export async function getRequestStatus(requestId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, status, request_type, full_name, email, created_at, updated_at")
    .eq("id", requestId)
    .maybeSingle();

  if (error) throw new Error(error.message || "Failed to fetch request status.");
  return data;
}

/* ─── getMyRequests ───────────────────────────────────────── */

/**
 * Get all service requests for a given email address.
 * Ordered newest first.
 * @param {string} email
 * @returns {Promise<object[]>}
 */
export async function getMyRequests(email) {
  if (!email) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, request_type, full_name, company_name, status, created_at, updated_at, asset_type, description"
    )
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Failed to fetch your requests.");
  return data ?? [];
}

/* ─── cancelRequest ───────────────────────────────────────── */

/**
 * Allow an applicant to cancel their own pending request.
 * Only works on "pending" rows (enforced both here and by RLS).
 * @param {string} requestId
 * @param {string} email  — used to verify ownership
 */
export async function cancelRequest(requestId, email) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("email", email.trim().toLowerCase())
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to cancel request.");
  return data;
}

/* ─── Constants (exported for use in forms / UI) ─────────── */

export const REQUEST_TYPES = {
  ASSET_TOKENIZATION: "asset_tokenization",
  CONSULTANCY: "consultancy",
};

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

export const STATUS_LABELS = {
  pending:   "Under Review",
  approved:  "Approved",
  rejected:  "Rejected",
  cancelled: "Cancelled",
};

export const STATUS_COLORS = {
  pending:   { bg: "var(--amber-light)",  text: "var(--amber)" },
  approved:  { bg: "var(--green-light)",  text: "var(--green)" },
  rejected:  { bg: "var(--red-light)",    text: "var(--red)"   },
  cancelled: { bg: "var(--bg-section)",   text: "var(--text-muted)" },
};
