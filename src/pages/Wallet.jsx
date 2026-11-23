import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/common/ToastProvider";
import { getTransactionsForUser, depositSimulation, withdrawSimulation, transferBetweenUsers } from "../services/transactionService";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import { isDemoMode } from "../data/demoData";
import "./Dashboard.css";

// TODO (Future Integration): Real-time token pricing — subscribe to a market
// price feed (e.g. via WebSocket or a polling API) and display the live
// exchange rate alongside the INR balance here.

const ACTIONS = [
  { label:"Send",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
  { label:"Receive",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> },
  { label:"Deposit",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { label:"Withdraw", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
];

function MiniLineChart() {
  const pts = [40, 55, 48, 62, 70, 65, 80, 74, 88, 82, 95, 91];
  const W = 500, H = 80, max = 100;
  const s = pts.map((v, i) => `${(i / (pts.length - 1)) * (W - 20) + 10},${H - 8 - ((v / max) * (H - 16))}`).join(" ");
  const area = `10,${H} ` + s + ` ${W - 10},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#0260C6" stopOpacity="0.0" />
        </linearGradient>
        <filter id="glow-line" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <polygon points={area} fill="url(#wfill)" />
      <polyline points={s} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-line)" />
    </svg>
  );
}

/** Format current month and year for the transaction history subtitle */
function getCurrentMonthLabel() {
  return new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function Wallet() {
  const [modal, setModal]                   = useState(null);
  const { wallet, user, refreshWallet }     = useAuth();
  const [transactions, setTransactions]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [txError, setTxError]               = useState("");
  const [actionError, setActionError]       = useState("");
  const [actionLoading, setActionLoading]   = useState(false);
  const [exportingCsv, setExportingCsv]     = useState(false);
  const toast = useToast();
  const [amountInput, setAmountInput]       = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [noteInput, setNoteInput]           = useState("");

  const balance          = wallet?.balance ?? 0;
  const formattedBalance = "₹" + Number(balance).toLocaleString("en-IN");
  const walletUserId     = isDemoMode()
    ? "USR-DEMO-CRESOX"
    : user?.id
      ? `USR-${user.id.slice(0,8).toUpperCase()}-CRESOX`
      : "USR-XXXXXX-CRESOX";
  const monthLabel = getCurrentMonthLabel();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const txs = await getTransactionsForUser(user.id, 50);
        if (!mounted) return;
        setTransactions(txs || []);
      } catch (err) {
        console.error("Failed to load transactions:", err.message);
        if (mounted) setTxError(err.message || "Failed to load transactions");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const txs = await getTransactionsForUser(user.id, 50);
      setTransactions(txs || []);
      setTxError("");
    } catch (err) {
      console.error("Failed to load transactions:", err.message);
      setTxError(err.message || "Failed to load transactions");
      toast.error("We couldn't load your transaction history right now.");
    } finally {
      setLoading(false);
    }
  };

  // ── Real computed quick stats from live transactions ──────────
  const quickStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear  = new Date().getFullYear();

    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalReceived = thisMonth
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalSent = thisMonth
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    // Marketplace spend: outgoing transactions of type "purchase" or "order"
    // TODO (Future Integration): Tag transactions with a more granular type
    // (e.g. "marketplace_purchase") for accurate spend breakdown by category.
    const marketplaceSpend = thisMonth
      .filter((tx) => tx.amount < 0 && /purchase|order|buy/i.test(tx.type || ""))
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    return { totalReceived, totalSent, marketplaceSpend };
  }, [transactions]);

  const handleModalOpen = (action) => {
    setAmountInput("");
    setRecipientInput("");
    setNoteInput("");
    setActionError("");
    setModal(action);
  };

  const handleExportCsv = async () => {
    if (!user) {
      toast.error("Please sign in to export your wallet history.");
      return;
    }

    setExportingCsv(true);
    try {
      const exportTransactions = await getTransactionsForUser(user.id, null);
      const rows = [
        ["Date", "Transaction ID", "Transaction Type", "Amount", "Status", "Counterparty", "Blockchain Verification Status"],
      ];

      (exportTransactions || []).forEach((tx) => {
        const counterparty =
          tx.counterparty_name ||
          tx.counterparty?.full_name ||
          (isDemoMode() ? "CresoX Network Partner" : (tx.counterparty?.email || "—"));
        const status = tx.status
          ? (tx.status === "verified" ? "Verified" : tx.status.charAt(0).toUpperCase() + tx.status.slice(1))
          : "Pending";
        const blockchainStatus = tx.blockchain_hash ? "Verified" : "Pending";
        const amount = Number(tx.amount || 0);
        rows.push([
          tx.created_at
            ? new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "—",
          tx.id || "—",
          tx.type || "—",
          `${amount >= 0 ? "+" : "-"}₹${Math.abs(amount).toLocaleString("en-IN")}`,
          status,
          counterparty,
          blockchainStatus,
        ]);
      });

      const csvContent = rows
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Wallet transactions exported successfully.");
    } catch (err) {
      console.error("CSV export failed:", err.message);
      toast.error("We couldn't export your wallet history. Please try again.");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (!user) throw new Error("Please log in to continue.");
      setActionLoading(true);
      setActionError("");

      if (modal === "Deposit") {
        const amt = Number(amountInput);
        if (!amt || amt <= 0) throw new Error("Enter a valid deposit amount.");
        await depositSimulation(user.id, amt);
        await refreshWallet();
        toast.success("Deposit completed successfully.");
      } else if (modal === "Withdraw") {
        const amt = Number(amountInput);
        if (!amt || amt <= 0) throw new Error("Enter a valid withdrawal amount.");
        if (amt > (wallet?.balance || 0)) throw new Error("You do not have enough funds for this withdrawal.");
        await withdrawSimulation(user.id, amt);
        await refreshWallet();
        window.dispatchEvent(new Event("orders:changed"));
        window.dispatchEvent(new Event("marketplace:changed"));
        toast.success("Withdrawal completed successfully.");
      } else if (modal === "Send") {
        const amt = Number(amountInput);
        if (!recipientInput.trim()) throw new Error(isDemoMode() ? "Enter the recipient account or user ID." : "Enter the recipient email or user ID.");
        if (!amt || amt <= 0) throw new Error("Enter a valid transfer amount.");
        if (amt > (wallet?.balance || 0)) throw new Error("Insufficient balance");
        await transferBetweenUsers(user.id, recipientInput.trim(), amt, noteInput.trim());
        await refreshWallet();
        window.dispatchEvent(new Event("orders:changed"));
        window.dispatchEvent(new Event("marketplace:changed"));
        toast.success("Transfer completed successfully.");
      }

      await loadTransactions();
      setModal(null);
    } catch (err) {
      console.error("Wallet action failed:", err.message);
      const message = err.message || "We couldn't complete that request.";
      if (message.includes("Recipient not found")) {
        setActionError(isDemoMode() ? "We couldn't find that recipient. Please check the account ID and try again." : "We couldn't find that recipient. Please check the email or user ID and try again.");
        toast.warning("Recipient not found");
      } else if (message.includes("Insufficient balance")) {
        setActionError("You do not have enough funds to complete this action.");
        toast.warning("Insufficient balance");
      } else if (message.includes("Failed to fetch") || message.includes("Network")) {
        setActionError("We couldn't reach the network. Please try again in a moment.");
        toast.error("Network error");
      } else {
        setActionError(message);
        toast.error(message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Manage your funds and transaction history</p>
      </div>

      <div className="two-col" style={{marginBottom:"var(--sp-5)"}}>
        {/* Balance card */}
        <div
          className="content-card wallet-balance-banner"
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, #FF5722 0%, #0260C6 50%, #38BDF8 100%)",
            }}
          />
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Available Balance</div>
              <div className="content-card__sub">CresoX Verified Individual Wallet · Mainnet</div>
            </div>
            <span className="badge badge-green"><span className="dot-live" aria-hidden="true"></span> Active</span>
          </div>
          <div className="wallet-balance-amount">
            {formattedBalance}
          </div>
          <div style={{fontSize:13,color:"var(--text-secondary)",marginBottom:"var(--sp-6)"}}>
            Verified on-chain balance · CresoX Ledger
          </div>
          <MiniLineChart/>
          <div style={{display:"flex",gap:"var(--sp-3)",marginTop:"var(--sp-5)",flexWrap:"wrap"}}>
            {ACTIONS.map(a => (
              <button
                key={a.label}
                className="btn btn-ghost wallet-banner-action-btn"
                onClick={() => handleModalOpen(a.label)}
                aria-label={`${a.label} funds`}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real computed quick stats */}
        <div style={{display:"flex",flexDirection:"column",gap:"var(--sp-4)"}}>
          {loading ? (
            <LoadingSkeleton rows={4} height={68} />
          ) : (
            [
              { label:`Total Received (${monthLabel})`,  value: `₹${quickStats.totalReceived.toLocaleString("en-IN")}`,   up: true  },
              { label:`Total Sent (${monthLabel})`,       value: `₹${quickStats.totalSent.toLocaleString("en-IN")}`,       up: false },
              { label:"Marketplace Spend",                value: quickStats.marketplaceSpend > 0 ? `₹${quickStats.marketplaceSpend.toLocaleString("en-IN")}` : "—", up: false },
              { label:"Blockchain Tx Verified",          value: `${transactions.filter(tx => tx.blockchain_hash).length} of ${transactions.length}`, up: null  },
            ].map(s => (
              <div className="kpi-card" key={s.label} style={{padding:"var(--sp-4) var(--sp-5)"}}>
                <div className="kpi-card__label">{s.label}</div>
                <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginTop:"var(--sp-2)"}}>
                  <span className="kpi-card__value" style={{fontSize:18}}>{s.value}</span>
                  {s.up !== null && (
                    <span style={{fontSize:12,fontWeight:600,color:s.up?"var(--green)":"var(--red)"}}>
                      {s.up ? "↑ Received" : "↓ Outgoing"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History */}
      <div className="content-card">
        <div className="content-card__header">
          <div>
            <div className="content-card__title">Transaction History</div>
            <div className="content-card__sub">{monthLabel}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleExportCsv}
            disabled={exportingCsv || loading}
            aria-busy={exportingCsv}
          >
            {exportingCsv ? "Exporting…" : "Export CSV"}
          </button>
        </div>
        {loading ? (
          <LoadingSkeleton rows={5} height={52} />
        ) : txError ? (
          <div style={{textAlign:"center",padding:"var(--sp-6)",color:"var(--red)"}}>
            {txError}
            <button className="btn btn-ghost btn-sm" style={{marginLeft:8}} onClick={loadTransactions}>Retry</button>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{textAlign:"center",padding:"var(--sp-6)",color:"var(--text-muted)"}}>
            No transactions yet. Your activity will appear here once you make a move.
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Type</th><th>Party</th>
                  <th>Amount</th><th>Status</th><th>Blockchain</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{fontFamily:"monospace",color:"var(--text-muted)",fontSize:12}}>{tx.id}</td>
                    <td>{tx.type}</td>
                    <td style={{fontWeight:600,color:"var(--text-primary)"}}>
                      {tx.counterparty_name || tx.counterparty?.full_name || (isDemoMode() ? "CresoX Network Partner" : (tx.counterparty?.email || "—"))}
                    </td>
                    <td style={{fontWeight:700,fontFamily:"monospace",color:(tx.amount>0)?"var(--green)":"var(--text-primary)"}}>
                      {tx.amount>0 ? `+₹${Number(tx.amount).toLocaleString('en-IN')}` : `-₹${Math.abs(Number(tx.amount)).toLocaleString('en-IN')}`}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${tx.status}`}>
                        {tx.status === "verified" ? "✓ Verified" : "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${tx.blockchain_hash ? 'status-badge--verified' : 'status-badge--pending'}`}>
                        {tx.blockchain_hash ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td style={{color:"var(--text-muted)"}}>
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${modal} funds`}
        >
          <div
            className="content-card animate-fade-up"
            style={{width:420,maxWidth:"90vw",margin:0}}
            onClick={e => e.stopPropagation()}
          >
            <div className="content-card__header">
              <div className="content-card__title">{modal}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)} aria-label="Close modal">✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"var(--sp-4)"}}>
              {modal === "Send" && (
                <>
                  <div className="auth-field">
                    <label className="input-label" htmlFor="wallet-recipient">
                      {isDemoMode() ? "Recipient Account or User ID" : "Recipient Email or User ID"}
                    </label>
                    <input
                      id="wallet-recipient"
                      className="input"
                      placeholder={isDemoMode() ? "e.g. USR-7821-CRESOX" : "User id (or) User mail"}
                      value={recipientInput}
                      onChange={e => setRecipientInput(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="input-label" htmlFor="wallet-amount-send">Amount (₹)</label>
                    <input
                      id="wallet-amount-send"
                      className="input"
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="input-label" htmlFor="wallet-note">Note (optional)</label>
                    <input
                      id="wallet-note"
                      className="input"
                      placeholder="Invoice #123…"
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    />
                  </div>
                </>
              )}
              {modal === "Receive" && (
                <div style={{textAlign:"center",padding:"var(--sp-4)"}}>
                  <div style={{fontFamily:"monospace",fontSize:14,color:"var(--blue)",background:"var(--blue-light)",padding:"var(--sp-4)",borderRadius:"var(--r-md)",border:"1px solid var(--border-focus)",wordBreak:"break-all"}}>
                    {walletUserId}
                  </div>
                  <p style={{fontSize:13,color:"var(--text-muted)",marginTop:"var(--sp-3)"}}>
                    Share this ID with the sender. Funds arrive instantly.
                  </p>
                </div>
              )}
              {(modal === "Deposit" || modal === "Withdraw") && (
                <>
                  <div className="auth-field">
                    <label className="input-label" htmlFor="wallet-bank">Bank Account</label>
                    <select id="wallet-bank" className="input">
                      <option>HDFC Bank •••• 4521</option>
                      <option>SBI Savings •••• 9012</option>
                    </select>
                  </div>
                  <div className="auth-field">
                    <label className="input-label" htmlFor="wallet-amount">Amount (₹)</label>
                    <input
                      id="wallet-amount"
                      className="input"
                      type="number"
                      min="100"
                      placeholder="Minimum ₹100"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                    />
                  </div>
                </>
              )}
              {actionError && <div className="auth-error" role="alert">{actionError}</div>}
              <div style={{display:"flex",gap:12}}>
                <button
                  className="btn btn-primary auth-submit"
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  aria-busy={actionLoading}
                >
                  {actionLoading ? "Processing…" : `Confirm ${modal}`}
                </button>
                <button className="btn btn-ghost" onClick={() => setModal(null)} disabled={actionLoading}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;
