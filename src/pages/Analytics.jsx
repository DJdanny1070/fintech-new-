import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getProducts, getRecentOrders } from "../services/productService";
import { getTransactionsForUser } from "../services/transactionService";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import "./Dashboard.css";

// TODO (Future Integration): Replace MONTHLY / WEEKLY static data with live
// aggregated data from the Supabase database. Consider adding a Postgres
// function or edge function that buckets transactions by week / month.
// For real-time updates, subscribe via Supabase Realtime channels.

// TODO (Future Integration): Market API integration point — connect MONTHLY
// and WEEKLY data to a financial market data provider (e.g. Alpha Vantage,
// Polygon.io) once regulatory approval is in place.

function BarChart({ data, color = "#38BDF8" }) {
  const max = Math.max(1, ...data.map(d => d.v));
  return (
    <svg className="analytics-bar-chart" viewBox="0 0 500 120" style={{width:"100%",height:120}} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`bg${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.25"/>
        </linearGradient>
        <filter id="bar-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {data.map((d, i) => {
        const bw = 28, gap = (500 - data.length * bw) / (data.length + 1);
        const x  = gap + i * (bw + gap);
        const h  = (d.v / max) * 85;
        return (
          <g key={`${d.l}-${i}`}>
            <rect x={x} y={100-h} width={bw} height={h} fill={`url(#bg${color.replace(/[^a-zA-Z0-9]/g, "")})`} rx="4" filter="url(#bar-glow)"/>
            <circle cx={x+bw/2} cy={100-h} r="2.5" fill="#FFFFFF" opacity="0.9"/>
            <text x={x+bw/2} y={94-h} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} style={{fontFamily:"monospace"}}>{d.v}</text>
            <text x={x+bw/2} y="114" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748B">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = "#FF5722" }) {
  const max = Math.max(1, ...data.map(d => d.v));
  const W=500, H=100;
  const pts  = data.map((d,i) => `${(i/(data.length-1))*(W-20)+10},${H-16-((d.v/max)*(H-30))}`).join(" ");
  const area = `10,${H} ` + pts + ` ${W-10},${H}`;
  return (
    <svg className="analytics-line-chart" viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:100}} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`lf${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
        <filter id="line-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <polygon points={area} fill={`url(#lf${color.replace(/[^a-zA-Z0-9]/g, "")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#line-glow)"/>
    </svg>
  );
}

const MONTHLY = [
  {l:"Jan",v:82},{l:"Feb",v:91},{l:"Mar",v:78},{l:"Apr",v:105},
  {l:"May",v:98},{l:"Jun",v:120},{l:"Jul",v:113},{l:"Aug",v:130},
  {l:"Sep",v:125},{l:"Oct",v:140},{l:"Nov",v:135},{l:"Dec",v:155},
];
const WEEKLY = [
  {l:"Mon",v:48},{l:"Tue",v:65},{l:"Wed",v:52},{l:"Thu",v:74},
  {l:"Fri",v:89},{l:"Sat",v:43},{l:"Sun",v:37},
];

const ASSETS = [
  { name:"Portfolio Fund A", type:"Mutual Fund",  value:"₹4,80,000", change:"↑ 18.2%", up:true  },
  { name:"Nifty 50 ETF",    type:"Index Fund",   value:"₹2,20,000", change:"↑ 12.1%", up:true  },
  { name:"Gold ETF",        type:"Commodity",    value:"₹80,000",   change:"↑ 5.4%",  up:true  },
  { name:"Govt Bond 2028",  type:"Fixed Income", value:"₹1,50,000", change:"↑ 3.8%",  up:true  },
  { name:"HDFC Shares",     type:"Equity",       value:"₹1,40,000", change:"↓ 2.1%",  up:false },
];

function Analytics() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [range, setRange]             = useState("1Y");
  const [products, setProducts]       = useState([]);
  const [orders, setOrders]           = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) {
        setProducts([]);
        setOrders([]);
        setTransactions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [productData, orderData, txData] = await Promise.all([
          getProducts({}),
          getRecentOrders(user.id, 10),
          getTransactionsForUser(user.id, 10),
        ]);
        if (!mounted) return;
        setProducts(productData || []);
        setOrders(orderData || []);
        setTransactions(txData || []);
      } catch (err) {
        console.error("Analytics load failed:", err.message);
        if (mounted) setError("We couldn't load your analytics right now. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [user]);

  const summary = useMemo(() => {
    const marketplaceValue = (products || []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const orderCount       = (orders || []).length;
    const txCount          = (transactions || []).length;
    return { marketplaceValue, orderCount, txCount };
  }, [products, orders, transactions]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Analytics</h1>
            <p>Track your financial performance across all activity</p>
          </div>
          <div style={{display:"flex",gap:"var(--sp-1)",flexWrap:"wrap"}}>
            {["7D","1M","3M","6M","1Y"].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`btn btn-sm ${range===r?"btn-primary":"btn-secondary"}`}
                aria-pressed={range === r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{marginBottom:"var(--sp-5)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      <div className="kpi-grid" style={{marginBottom:"var(--sp-5)"}}>
        {loading ? (
          Array.from({length: 4}).map((_, i) => (
            <div className="kpi-card" key={i}>
              <LoadingSkeleton rows={2} height={22} gap={8} />
            </div>
          ))
        ) : (
          [
            { label:"Total Revenue",       value:`₹${Math.round(summary.marketplaceValue).toLocaleString("en-IN")}`, change:"Live marketplace value",  up:true  },
            { label:"Marketplace Volume",  value:`${summary.orderCount} orders`,   change:"Recent activity",         up:true  },
            { label:"Avg. Monthly Growth", value:`${summary.txCount} txns`,        change:"Recent transactions",     up:true  },
            { label:"Blockchain Records",  value:"Active",                         change:"Hash-backed records",     up:null  },
          ].map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-card__label">{k.label}</div>
              <div className="kpi-card__value" style={{marginTop:"var(--sp-2)"}}>{k.value}</div>
              <div className={`kpi-card__change ${k.up===true?"up":k.up===false?"down":"neutral"}`}>{k.change}</div>
            </div>
          ))
        )}
      </div>

      <div className="two-col" style={{marginBottom:"var(--sp-5)"}}>
        <div className="content-card analytics-chart-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Monthly Revenue</div>
              <div className="content-card__sub">Full year · ₹ in Lakhs</div>
            </div>
            <span className="badge badge-green">↑ 22.4%</span>
          </div>
          {/* TODO (Future Integration): Replace MONTHLY with aggregated
              monthly revenue from the transactions table */}
          <BarChart data={MONTHLY}/>
        </div>
        <div className="content-card">
          <div className="content-card__header">
            <div>
              <div className="content-card__title">Transaction Volume</div>
              <div className="content-card__sub">This week · ₹ in Lakhs</div>
            </div>
            <span className="badge badge-blue">↑ 34.1%</span>
          </div>
          {/* TODO (Future Integration): Replace WEEKLY with real weekly
              transaction volume bucketed from the transactions table */}
          <LineChart data={WEEKLY} color="#FF5722"/>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card__header">
          <div className="content-card__title">Top Assets</div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/dashboard/analytics/portfolio")}
          >
            View Portfolio →
          </button>
        </div>
        {/* TODO (Future Integration): Replace static ASSETS array with real
            portfolio data from the portfolio analytics engine once integrated. */}
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Asset</th><th>Type</th><th>Value</th><th>Change</th></tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.name}>
                  <td style={{fontWeight:600,color:"var(--text-primary)"}}>{a.name}</td>
                  <td><span className="badge badge-gray">{a.type}</span></td>
                  <td style={{fontWeight:700,letterSpacing:"-0.02em"}}>{a.value}</td>
                  <td style={{fontWeight:700,color:a.up?"var(--green)":"var(--red)"}}>{a.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
