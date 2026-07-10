import { useState, useEffect, useMemo } from "react";
import {
  getRecentHashes,
  getHashFeed,
  getHashStatsByType,
  getHashesByEntity,
  searchHashes,
  getHashCount,
} from "../services/hashService";
import { getProduct, getProducts } from "../services/productService";
import { getProfileByEmail } from "../services/profileService";
import "./Dashboard.css";
import "./Blockchain.css";
import { useToast } from "../components/common/ToastProvider";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shorten(h, chars = 8) {
  if (!h) return "—";
  return `${h.slice(0, chars)}…${h.slice(-chars)}`;
}

async function copyText(text) {
  if (!text) return false;
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

function fmtDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDateShort(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Entity type configuration ────────────────────────────────────────────────

const EVENT_TYPES = {
  all:                   { label: "All Events",             color: "var(--blue)",    bg: "var(--blue-light)",    icon: "⬡" },
  profile:               { label: "Profile Created",        color: "#6366f1",        bg: "#EEF2FF",              icon: "👤" },
  asset:                 { label: "Asset Listed",           color: "var(--blue)",    bg: "var(--blue-light)",    icon: "🏷️" },
  token_purchase:        { label: "Token Purchase",         color: "var(--green)",   bg: "var(--green-light)",   icon: "🛒" },
  token_transfer:        { label: "Token Transfer",         color: "#0891b2",        bg: "#ECFEFF",              icon: "↔️" },
  wallet_transaction:    { label: "Wallet Transaction",     color: "var(--amber)",   bg: "var(--amber-light)",   icon: "💳" },
  verification_approval: { label: "Verification Approval",  color: "var(--green)",   bg: "var(--green-light)",   icon: "✅" },
  ownership_change:      { label: "Ownership Change",       color: "#7c3aed",        bg: "#F5F3FF",              icon: "📊" },
  // Legacy types
  transaction:           { label: "Transaction (Legacy)",   color: "var(--amber)",   bg: "var(--amber-light)",   icon: "💸" },
  product:               { label: "Product (Legacy)",       color: "var(--text-muted)", bg: "var(--bg-section)", icon: "📦" },
};

function EventChip({ type, small = false }) {
  const cfg = EVENT_TYPES[type] || EVENT_TYPES.all;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        padding: small ? "2px 8px" : "3px 10px",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Pillar card (Security, Transparency, etc.) ───────────────────────────────

function PillarCard({ icon, title, color, bg, description, points }) {
  return (
    <div
      style={{
        background: "var(--bg-white)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: "var(--sp-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-3)",
        transition: "border-color var(--t)",
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = color)}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
        <div
          style={{
            width: 42, height: 42,
            borderRadius: "var(--r-md)",
            background: bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
          {title}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
        {description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border)", paddingTop: "var(--sp-3)" }}>
        {points.map((pt) => (
          <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {pt}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatStrip({ totalHashes, typeStats }) {
  const topTypes = typeStats.slice(0, 4);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
      <div className="content-card" style={{ padding: "var(--sp-4) var(--sp-5)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Total Records
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          {totalHashes.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginTop: 3 }}>
          SHA-256 hashes on file
        </div>
      </div>
      {topTypes.map((t) => {
        const cfg = EVENT_TYPES[t.entity_type] || EVENT_TYPES.all;
        return (
          <div className="content-card" key={t.entity_type} style={{ padding: "var(--sp-4) var(--sp-5)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {cfg.icon} {cfg.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: cfg.color }}>
              {t.count.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginTop: 3 }}>
              records
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hash row ─────────────────────────────────────────────────────────────────

function HashRow({ r, onCopy }) {
  return (
    <tr key={r.id}>
      <td>
        <EventChip type={r.entity_type} small />
      </td>
      <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
        {shorten(r.sha256_hash)}
      </td>
      <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
        {shorten(r.entity_id, 6)}
      </td>
      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {fmtDateShort(r.created_at)}
      </td>
      <td>
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
          <span className="status-badge status-badge--verified" style={{ fontSize: 11 }}>
            ✔ Verified
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onCopy(r.sha256_hash)}
            style={{ padding: "4px 10px", fontSize: 12 }}
            title="Copy full hash"
          >
            Copy
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Blockchain() {
  const toast = useToast();

  // ── Feed state
  const [feedType, setFeedType]   = useState("all");
  const [feed, setFeed]           = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // ── Search state
  const [searchMode, setSearchMode] = useState("hash");
  const [query, setQuery]           = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]     = useState("");
  const [searchPage, setSearchPage]       = useState(1);
  const PAGE_SIZE = 8;

  // ── Stats
  const [totalHashes, setTotalHashes] = useState(0);
  const [typeStats, setTypeStats]     = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Verify tool
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'found' | 'not_found'
  const [verifyRecord, setVerifyRecord] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Load feed when type changes
  useEffect(() => {
    let mounted = true;
    setFeedLoading(true);
    getHashFeed({ entityType: feedType, limit: 20 })
      .then((data) => { if (mounted) setFeed(data || []); })
      .catch(() => {})
      .finally(() => { if (mounted) setFeedLoading(false); });
    return () => { mounted = false; };
  }, [feedType]);

  // Load stats on mount
  useEffect(() => {
    let mounted = true;
    setStatsLoading(true);
    Promise.all([getHashCount(), getHashStatsByType()])
      .then(([count, stats]) => {
        if (!mounted) return;
        setTotalHashes(count || 0);
        setTypeStats(stats || []);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setStatsLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Search
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    setSearchPage(1);
    try {
      if (searchMode === "hash") {
        const res = await searchHashes(query, 50);
        setSearchResults(res || []);
        if (!res?.length) setSearchError("No matching hash records found.");
      } else if (searchMode === "asset") {
        let prod = null;
        if (query.includes("-")) {
          try { prod = await getProduct(query); } catch { /* try title next */ }
        }
        if (!prod) {
          const list = await getProducts({ search: query });
          prod = list?.[0] || null;
        }
        if (!prod) { setSearchError("No asset found for that query."); }
        else {
          const res = await getHashesByEntity("asset", prod.id);
          setSearchResults(res || []);
          if (!res?.length) setSearchError("No hash records for this asset yet.");
        }
      } else if (searchMode === "user") {
        let profile = null;
        if (query.includes("@")) {
          profile = await getProfileByEmail(query.trim());
        } else {
          try {
            const { supabase } = await import("../services/supabase");
            const { data } = await supabase.from("profiles").select("*").eq("id", query.trim()).single();
            profile = data || null;
          } catch { /* ignore */ }
        }
        if (!profile) { setSearchError("User not found."); }
        else {
          const res = await getHashesByEntity("profile", profile.id);
          setSearchResults(res || []);
          if (!res?.length) setSearchError("No hash records for this user yet.");
        }
      } else if (searchMode === "order") {
        const res = await getHashesByEntity("token_purchase", query.trim());
        setSearchResults(res || []);
        if (!res?.length) setSearchError("No purchase hash record for that order ID.");
      }
    } catch (err) {
      setSearchError(err.message || "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Verify
  const handleVerify = async () => {
    const h = verifyHash.trim();
    if (!h) return;
    setVerifyLoading(true);
    setVerifyStatus(null);
    setVerifyRecord(null);
    try {
      const res = await searchHashes(h, 1);
      if (res && res.length > 0) {
        setVerifyStatus("found");
        setVerifyRecord(res[0]);
      } else {
        setVerifyStatus("not_found");
      }
    } catch {
      setVerifyStatus("not_found");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCopy = async (hash) => {
    const ok = await copyText(hash);
    toast.success(ok ? "Hash copied to clipboard." : "Copy failed.");
  };

  // Paginate search results
  const totalPages = Math.max(1, Math.ceil(searchResults.length / PAGE_SIZE));
  const safePage = Math.min(searchPage, totalPages);
  const visibleResults = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return searchResults.slice(start, start + PAGE_SIZE);
  }, [searchResults, safePage]);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Blockchain Ledger</h1>
            <p>
              Every critical event on CresoX is fingerprinted with a SHA-256 hash — immutable,
              verifiable, tamper-evident.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
            <span className="badge badge-green">
              <span className="dot-live" style={{ marginRight: 5 }} />
              SHA-256 Active
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--blue)",
                background: "var(--blue-light)",
                borderRadius: "var(--r-full)",
                padding: "4px 12px",
              }}
            >
              Chain-ready architecture
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      {statsLoading ? (
        <div className="content-card" style={{ marginBottom: "var(--sp-5)" }}>
          <LoadingSkeleton rows={1} />
        </div>
      ) : (
        <StatStrip totalHashes={totalHashes} typeStats={typeStats} />
      )}

      {/* ── How blockchain works — 4 pillars ────────────── */}
      <div className="content-card" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="content-card__header">
          <div>
            <div className="content-card__title">How CresoX Blockchain Works</div>
            <div className="content-card__sub">
              Every event generates a unique fingerprint. No one can change the past.
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-full)",
              padding: "4px 12px",
            }}
          >
            SHA-256 · On-chain ready
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4)" }}>
          <PillarCard
            icon="🔐"
            title="Security"
            color="var(--blue)"
            bg="var(--blue-light)"
            description="Every record is hashed with SHA-256 — the same algorithm used by Bitcoin. Even a single character change produces a completely different hash, making tampering immediately detectable."
            points={[
              "SHA-256 is cryptographically irreversible",
              "A 1-character change = 100% different hash",
              "No central authority can edit records",
              "Keys are stored outside user reach",
            ]}
          />
          <PillarCard
            icon="🔍"
            title="Transparency"
            color="var(--green)"
            bg="var(--green-light)"
            description="Every hash event is visible and searchable in this explorer. Anyone with access can verify that a profile was created, an asset was listed, or a token was transferred — exactly when it happened."
            points={[
              "Full audit trail for every event",
              "Searchable by hash, asset, user or order",
              "Timestamps are locked at event time",
              "Readable by all approved platform users",
            ]}
          />
          <PillarCard
            icon="🧩"
            title="Data Integrity"
            color="#7c3aed"
            bg="#F5F3FF"
            description="The hash is computed from the complete data payload — including the entity ID, all field values, and a precise timestamp. Any change to the stored data will break the hash, flagging corruption."
            points={[
              "Hash includes all field values + timestamp",
              "Ledger cross-references the source record",
              "Broken hash = automatic tamper alert",
              "Ready to anchor on Ethereum/Polygon",
            ]}
          />
          <PillarCard
            icon="🛡️"
            title="Tamper Detection"
            color="#0891b2"
            bg="#ECFEFF"
            description="Use the Verify Hash tool below to check any hash in the ledger. If the hash is present, the event is authentic. If it's missing, the record was not generated by CresoX and should be treated as invalid."
            points={[
              "Paste any hash to verify in real-time",
              "Instant presence check against ledger",
              "Missing hash = event is suspect",
              "Future: on-chain Merkle proof verification",
            ]}
          />
        </div>
      </div>

      {/* ── Event types covered ──────────────────────────── */}
      <div className="content-card" style={{ marginBottom: "var(--sp-5)" }}>
        <div className="content-card__header">
          <div className="content-card__title">Events That Generate a Hash</div>
          <div className="content-card__sub">7 event types · automatic · non-blocking</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-3)" }}>
          {[
            { type: "profile",               when: "A user profile is created via invitation" },
            { type: "asset",                  when: "A tokenized asset is listed on the portal" },
            { type: "token_purchase",         when: "A buyer acquires a token (order placed)" },
            { type: "token_transfer",         when: "Token ownership transferred to another wallet" },
            { type: "wallet_transaction",     when: "Any wallet debit or credit (deposit / withdraw / send)" },
            { type: "verification_approval",  when: "KYC documents submitted or admin status changed" },
            { type: "ownership_change",       when: "Token ownership percentage recalculated after trade" },
          ].map(({ type, when }) => {
            const cfg = EVENT_TYPES[type];
            return (
              <div
                key={type}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}22`,
                  borderRadius: "var(--r-md)",
                  padding: "var(--sp-3) var(--sp-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>{when}</p>
              </div>
            );
          })}
          {/* Chain-ready notice */}
          <div
            style={{
              background: "var(--bg)",
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--r-md)",
              padding: "var(--sp-3) var(--sp-4)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⛓️</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>On-Chain Anchor</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
              Future: each hash root will be anchored to Ethereum or Polygon for maximum immutability.
            </p>
          </div>
        </div>
      </div>

      {/* ── Live feed + Verify tool ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--sp-5)", alignItems: "start", marginBottom: "var(--sp-5)" }}>

        {/* Live feed */}
        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Live Hash Feed</div>
              <div className="content-card__sub">Most recent events — auto-filtered by type</div>
            </div>
            <span className="badge badge-green">
              <span className="dot-live" style={{ marginRight: 5 }} />
              Live
            </span>
          </div>

          {/* Type filter chips */}
          <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap", marginBottom: "var(--sp-4)" }}>
            {["all", "profile", "asset", "token_purchase", "token_transfer", "wallet_transaction", "verification_approval", "ownership_change"].map((t) => {
              const cfg = EVENT_TYPES[t];
              const isActive = feedType === t;
              return (
                <button
                  key={t}
                  onClick={() => setFeedType(t)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: 999,
                    border: `1.5px solid ${isActive ? cfg.color : "var(--border)"}`,
                    background: isActive ? cfg.bg : "var(--bg-white)",
                    color: isActive ? cfg.color : "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    transition: "all var(--t)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cfg.icon} {t === "all" ? "All" : cfg.label.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {feedLoading ? (
            <LoadingSkeleton rows={5} />
          ) : feed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--sp-8)", color: "var(--text-muted)", fontSize: 14 }}>
              No records yet for this event type.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Hash</th>
                  <th>Entity ID</th>
                  <th>Time</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((r) => (
                  <HashRow key={r.id} r={r} onCopy={handleCopy} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Verify Hash tool */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <div className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">Verify a Hash</div>
              <div className="content-card__sub">Tamper detection</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                Paste any SHA-256 hash below. If it exists in the CresoX ledger, the event is authentic.
                A missing hash means the event was not generated by this platform.
              </p>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. a3f2b1c4d5e6f7..."
                value={verifyHash}
                onChange={(e) => { setVerifyHash(e.target.value); setVerifyStatus(null); }}
                style={{ fontFamily: "monospace", fontSize: 13, resize: "vertical" }}
              />
              <button
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={verifyLoading || !verifyHash.trim()}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {verifyLoading ? <><span className="spinner" /> Checking...</> : "Verify Hash →"}
              </button>

              {verifyStatus === "found" && verifyRecord && (
                <div
                  style={{
                    background: "var(--green-light)",
                    border: "1px solid rgba(22,163,74,0.25)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--sp-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>Hash Verified</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    <div><strong>Event:</strong> <EventChip type={verifyRecord.entity_type} small /></div>
                    <div style={{ marginTop: 4 }}><strong>Entity ID:</strong> <span style={{ fontFamily: "monospace" }}>{verifyRecord.entity_id}</span></div>
                    <div style={{ marginTop: 4 }}><strong>Recorded:</strong> {fmtDate(verifyRecord.created_at)}</div>
                  </div>
                </div>
              )}

              {verifyStatus === "not_found" && (
                <div
                  style={{
                    background: "var(--red-light)",
                    border: "1px solid rgba(224,1,11,0.18)",
                    borderRadius: "var(--r-md)",
                    padding: "var(--sp-4)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--red)" }}>Hash Not Found</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                      This hash does not exist in the CresoX ledger. The event may be invalid or the hash may be incorrect.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Future chain readiness */}
          <div
            style={{
              background: "var(--bg-white)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: "var(--sp-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-3)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              ⛓️ Future: On-Chain Anchor
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
              Today, hashes are stored in a secure off-chain ledger (Supabase).
              The next phase will anchor each hash root to a public blockchain
              (Ethereum or Polygon) for absolute immutability — no party,
              including CresoX, will be able to delete or alter a record.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { done: true,  label: "SHA-256 hash generation per event" },
                { done: true,  label: "Off-chain ledger with event typing" },
                { done: true,  label: "Explorer UI with search & verify" },
                { done: false, label: "Merkle root batching" },
                { done: false, label: "On-chain anchor (Polygon PoS)" },
                { done: false, label: "Zero-knowledge proof verification" },
              ].map(({ done, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: done ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {done ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search explorer ──────────────────────────────── */}
      <div className="content-card">
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Hash Explorer</div>
            <div className="content-card__sub">Search by hash fragment, asset, user or order ID</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--sp-3)", marginBottom: "var(--sp-4)", flexWrap: "wrap" }}>
          <select
            className="input"
            value={searchMode}
            onChange={(e) => { setSearchMode(e.target.value); setSearchResults([]); setSearchError(""); }}
            style={{ width: 160 }}
          >
            <option value="hash">By Hash</option>
            <option value="asset">By Asset</option>
            <option value="user">By User</option>
            <option value="order">By Order ID</option>
          </select>
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={
              searchMode === "hash"  ? "Enter hash or partial hash…" :
              searchMode === "asset" ? "Enter asset title or ID…" :
              searchMode === "user"  ? "Enter email or user ID…" :
              "Enter order ID…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searchLoading || !query.trim()}
          >
            {searchLoading ? <><span className="spinner" /> Searching…</> : "Search"}
          </button>
        </div>

        {searchError && (
          <div style={{ fontSize: 14, color: "var(--red)", marginBottom: "var(--sp-4)" }}>{searchError}</div>
        )}

        {searchResults.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Hash</th>
                  <th>Entity ID</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleResults.map((r) => (
                  <HashRow key={r.id} r={r} onCopy={handleCopy} />
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--sp-4)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, searchResults.length)} of {searchResults.length} records
              </div>
              <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSearchPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>Previous</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSearchPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Next</button>
              </div>
            </div>
          </>
        )}

        {!searchLoading && !searchError && searchResults.length === 0 && query && (
          <div style={{ textAlign: "center", padding: "var(--sp-6)", color: "var(--text-muted)", fontSize: 14 }}>
            Enter a query above and press Search to look up hash records.
          </div>
        )}
      </div>
    </div>
  );
}
