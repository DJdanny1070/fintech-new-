/**
 * CresoX Demo Mode Data & State Controller
 *
 * Provides realistic mock data for internship report screenshots and demonstration
 * without requiring live Supabase database connectivity, admin approval, or email verification.
 */

const DEMO_STORAGE_KEY = "cresox_demo_mode";
const DEMO_WALLET_KEY = "cresox_demo_wallet_balance";
const DEMO_ORDERS_KEY = "cresox_demo_orders";
const DEMO_TRANSACTIONS_KEY = "cresox_demo_transactions";
const DEMO_PRODUCTS_KEY = "cresox_demo_products";

export const DEMO_CREDENTIALS = {
  username: "demo",
  password: "CresoXDemo@2026",
};

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(DEMO_STORAGE_KEY) === "true" ||
    import.meta.env.VITE_DEMO_MODE === "true"
  );
}

export function enableDemoMode() {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_STORAGE_KEY, "true");
  }
}

export function disableDemoMode() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(DEMO_WALLET_KEY);
    localStorage.removeItem(DEMO_ORDERS_KEY);
    localStorage.removeItem(DEMO_TRANSACTIONS_KEY);
    localStorage.removeItem(DEMO_PRODUCTS_KEY);
  }
}

// ── Demo Auth Entities ──────────────────────────────────────────

export const DEMO_USER = {
  id: "demo-user-cresox-01",
  email: "demo@cresox.internal",
  aud: "authenticated",
  role: "authenticated",
  created_at: "2026-01-15T09:00:00.000Z",
};

export const DEMO_PROFILE = {
  id: "demo-user-cresox-01",
  full_name: "Jonathan Demo",
  username: "demo",
  email: "demo",
  phone: "+91 98765 43210",
  company_name: "Demo Capital Partners",
  role: "investor",
  approval_status: "Approved",
  verification_status: "Verified",
  avatar_url: null,
  created_at: "2026-01-15T09:00:00.000Z",
  updated_at: "2026-02-18T14:30:00.000Z",
};

export const INITIAL_DEMO_WALLET = {
  id: "demo-wallet-cresox-01",
  user_id: "demo-user-cresox-01",
  balance: 2450000,
  currency: "INR",
  created_at: "2026-01-15T09:00:00.000Z",
  updated_at: "2026-02-18T14:30:00.000Z",
};

// ── Demo Marketplace Products ───────────────────────────────────

export const INITIAL_DEMO_PRODUCTS = [
  {
    id: "prod-demo-01",
    title: "Emerald Horizon Tower A - Fractional Commercial Units",
    description: "Grade-A institutional IT park commercial space in Bengaluru Tech Corridor. Long-term triple net lease with Fortune 500 tenants, offering 9.2% targeted annual yield with quarterly payouts.",
    category: "Real Estate",
    price: 1250000,
    current_price: 1250000,
    previous_price: 1235500,
    daily_change: 14500,
    daily_change_percent: 1.17,
    trend: "up",
    quantity: 120,
    seller_id: "seller-demo-apex",
    seller: {
      full_name: "Apex Infrastructure Fund",
      company_name: "Apex Infrastructure Trust",
      verification_status: "Verified",
    },
    blockchain_hash: "8f7a93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c78",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-01T10:00:00Z",
    last_price_update: "2026-02-19T08:00:00Z",
    price_history: [1180000, 1195000, 1200000, 1210000, 1225000, 1220000, 1235500, 1250000],
  },
  {
    id: "prod-demo-02",
    title: "Solaris MegaPark Phase II (50MW Clean Grid)",
    description: "Utility-scale grid-connected photovoltaic installation in Rajasthan Solar Park with 25-year sovereign power purchase agreement (PPA) with NTPC.",
    category: "Renewable Energy",
    price: 850000,
    current_price: 850000,
    previous_price: 840800,
    daily_change: 9200,
    daily_change_percent: 1.09,
    trend: "up",
    quantity: 250,
    seller_id: "seller-demo-greenfield",
    seller: {
      full_name: "Greenfield Solar Ltd",
      company_name: "Greenfield Renewables",
      verification_status: "Verified",
    },
    blockchain_hash: "c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c788f7a93",
    image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-03T11:30:00Z",
    last_price_update: "2026-02-19T07:45:00Z",
    price_history: [810000, 815000, 820000, 835000, 830000, 840800, 850000],
  },
  {
    id: "prod-demo-03",
    title: "National Logistics Hub - Warehouse Cluster IV",
    description: "Automated fulfilment center in Western Dedicated Freight Corridor with multi-modal rail & highway connectivity, leased to Tier-1 logistics providers.",
    category: "Infrastructure",
    price: 2100000,
    current_price: 2100000,
    previous_price: 2081500,
    daily_change: 18500,
    daily_change_percent: 0.89,
    trend: "up",
    quantity: 80,
    seller_id: "seller-demo-bharat",
    seller: {
      full_name: "Bharat Cargo Infra",
      company_name: "Bharat Cargo Infrastructure",
      verification_status: "Verified",
    },
    blockchain_hash: "71a25d9c73e61845bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-05T09:15:00Z",
    last_price_update: "2026-02-19T06:20:00Z",
    price_history: [2010000, 2030000, 2045000, 2060000, 2075000, 2081500, 2100000],
  },
  {
    id: "prod-demo-04",
    title: "Grade-A Corporate Accounts Receivable Pool",
    description: "Short-duration tokenized receivables backed by blue-chip enterprise payables, verified on-ledger with 90-day maturity and annualized 8.4% coupon.",
    category: "Receivables",
    price: 680000,
    current_price: 680000,
    previous_price: 675900,
    daily_change: 4100,
    daily_change_percent: 0.61,
    trend: "up",
    quantity: 300,
    seller_id: "seller-demo-finvantage",
    seller: {
      full_name: "FinVantage Factoring",
      company_name: "FinVantage Capital",
      verification_status: "Verified",
    },
    blockchain_hash: "5bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73e6184",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-07T14:00:00Z",
    last_price_update: "2026-02-19T09:10:00Z",
    price_history: [660000, 665000, 670000, 672000, 675900, 680000],
  },
  {
    id: "prod-demo-05",
    title: "Heritage Rajputana Numismatic Vault Token",
    description: "Fractionalized ownership of a certified archival collection of 18th-century imperial gold and silver coinage held in bank vault custody with Lloyd's of London insurance.",
    category: "Arts & Collectibles",
    price: 4200000,
    current_price: 4200000,
    previous_price: 4145000,
    daily_change: 55000,
    daily_change_percent: 1.33,
    trend: "up",
    quantity: 45,
    seller_id: "seller-demo-sovereign",
    seller: {
      full_name: "Sovereign Heritage Trust",
      company_name: "Sovereign Numismatics",
      verification_status: "Verified",
    },
    blockchain_hash: "e61845bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73",
    image_url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-08T16:20:00Z",
    last_price_update: "2026-02-19T08:30:00Z",
    price_history: [3950000, 4020000, 4080000, 4120000, 4145000, 4200000],
  },
  {
    id: "prod-demo-06",
    title: "Azure Coast Luxury Villa Portfolio",
    description: "Boutique hospitality villa estate in North Goa leased to international luxury resort operator with dynamic revenue-sharing model and capital appreciation.",
    category: "Real Estate",
    price: 3200000,
    current_price: 3200000,
    previous_price: 3172000,
    daily_change: 28000,
    daily_change_percent: 0.88,
    trend: "up",
    quantity: 60,
    seller_id: "seller-demo-sterling",
    seller: {
      full_name: "Sterling Realty Trusts",
      company_name: "Sterling Estates Ltd",
      verification_status: "Verified",
    },
    blockchain_hash: "1a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d8",
    image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-10T12:00:00Z",
    last_price_update: "2026-02-19T07:15:00Z",
    price_history: [3100000, 3120000, 3150000, 3165000, 3172000, 3200000],
  },
  {
    id: "prod-demo-07",
    title: "WindStream Off-Shore Farm Units",
    description: "Off-shore wind generation units along the Tamil Nadu coastline feeding high-voltage southern grid. Subsidized green energy credits bundled with token distribution.",
    category: "Renewable Energy",
    price: 1420000,
    current_price: 1420000,
    previous_price: 1428400,
    daily_change: -8400,
    daily_change_percent: -0.59,
    trend: "down",
    quantity: 95,
    seller_id: "seller-demo-nordic",
    seller: {
      full_name: "Nordic Clean Energy",
      company_name: "Nordic Wind Systems",
      verification_status: "Verified",
    },
    blockchain_hash: "d9c73e61845bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25",
    image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-11T15:40:00Z",
    last_price_update: "2026-02-19T06:50:00Z",
    price_history: [1460000, 1450000, 1445000, 1435000, 1428400, 1420000],
  },
  {
    id: "prod-demo-08",
    title: "Trans-Metro Fiber Backbone Infrastructure",
    description: "High-density dark fiber optic conduit leased to enterprise telecom operators across metropolitan transit corridors with predictable long-term concession fees.",
    category: "Infrastructure",
    price: 950000,
    current_price: 950000,
    previous_price: 950000,
    daily_change: 0,
    daily_change_percent: 0.0,
    trend: "stable",
    quantity: 150,
    seller_id: "seller-demo-nexgen",
    seller: {
      full_name: "NexGen Telecom Assets",
      company_name: "NexGen Digital Infra",
      verification_status: "Verified",
    },
    blockchain_hash: "93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c788f7a",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-12T10:10:00Z",
    last_price_update: "2026-02-19T08:15:00Z",
    price_history: [950000, 950000, 950000, 950000, 950000, 950000],
  },
  {
    id: "prod-demo-09",
    title: "Export Trade Receivables - Q1 Basket",
    description: "Short-term insured trade financing for verified manufacturing exporters. Letters of credit backed by premier Indian commercial banks.",
    category: "Receivables",
    price: 1150000,
    current_price: 1150000,
    previous_price: 1150000,
    daily_change: 0,
    daily_change_percent: 0.0,
    trend: "stable",
    quantity: 180,
    seller_id: "seller-demo-silkroad",
    seller: {
      full_name: "SilkRoad Trade Finance",
      company_name: "SilkRoad Capital",
      verification_status: "Verified",
    },
    blockchain_hash: "2c788f7a93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-13T13:25:00Z",
    last_price_update: "2026-02-19T07:00:00Z",
    price_history: [1150000, 1150000, 1150000, 1150000, 1150000, 1150000],
  },
  {
    id: "prod-demo-10",
    title: "Modern Masters Contemporary Canvas Series",
    description: "Curated modern canvas art pieces by celebrated contemporary artists. Secured in specialized climate-controlled vault facility with physical inspection certifications.",
    category: "Arts & Collectibles",
    price: 1750000,
    current_price: 1750000,
    previous_price: 1762000,
    daily_change: -12000,
    daily_change_percent: -0.68,
    trend: "down",
    quantity: 50,
    seller_id: "seller-demo-curator",
    seller: {
      full_name: "Curator Guild International",
      company_name: "Curator Guild Ltd",
      verification_status: "Verified",
    },
    blockchain_hash: "60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c788f7a93c41e82b75d",
    image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    created_at: "2026-02-14T17:00:00Z",
    last_price_update: "2026-02-19T08:50:00Z",
    price_history: [1790000, 1785000, 1770000, 1765000, 1762000, 1750000],
  },
];

// ── Demo Orders ─────────────────────────────────────────────────

export const INITIAL_DEMO_ORDERS = [
  {
    id: "ord-demo-01",
    buyer_id: "demo-user-cresox-01",
    seller_id: "seller-demo-apex",
    product_id: "prod-demo-01",
    status: "completed",
    created_at: "2026-02-18T11:20:00Z",
    product: {
      id: "prod-demo-01",
      title: "Emerald Horizon Tower A - Fractional Commercial Units",
      price: 1250000,
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    },
    buyer: { full_name: "Jonathan Demo" },
    seller: { full_name: "Apex Infrastructure Fund" },
  },
  {
    id: "ord-demo-02",
    buyer_id: "demo-user-cresox-01",
    seller_id: "seller-demo-greenfield",
    product_id: "prod-demo-02",
    status: "completed",
    created_at: "2026-02-14T09:15:00Z",
    product: {
      id: "prod-demo-02",
      title: "Solaris MegaPark Phase II (50MW Clean Grid)",
      price: 850000,
      image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    },
    buyer: { full_name: "Jonathan Demo" },
    seller: { full_name: "Greenfield Solar Ltd" },
  },
  {
    id: "ord-demo-03",
    buyer_id: "demo-user-cresox-01",
    seller_id: "seller-demo-bharat",
    product_id: "prod-demo-03",
    status: "completed",
    created_at: "2026-02-08T16:40:00Z",
    product: {
      id: "prod-demo-03",
      title: "National Logistics Hub - Warehouse Cluster IV",
      price: 2100000,
      image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    },
    buyer: { full_name: "Jonathan Demo" },
    seller: { full_name: "Bharat Cargo Infra" },
  },
  {
    id: "ord-demo-04",
    buyer_id: "demo-user-cresox-01",
    seller_id: "seller-demo-finvantage",
    product_id: "prod-demo-04",
    status: "pending",
    created_at: "2026-02-19T10:05:00Z",
    product: {
      id: "prod-demo-04",
      title: "Grade-A Corporate Accounts Receivable Pool",
      price: 680000,
      image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    },
    buyer: { full_name: "Jonathan Demo" },
    seller: { full_name: "FinVantage Factoring" },
  },
  {
    id: "ord-demo-05",
    buyer_id: "user-partner-elena",
    seller_id: "demo-user-cresox-01",
    product_id: "prod-demo-02",
    status: "completed",
    created_at: "2026-02-17T14:10:00Z",
    product: {
      id: "prod-demo-02",
      title: "Solaris MegaPark Phase II (50MW Clean Grid)",
      price: 850000,
      image_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    },
    buyer: { full_name: "Elena Rostova" },
    seller: { full_name: "Jonathan Demo" },
  },
];

// ── Demo Transactions ───────────────────────────────────────────

export const INITIAL_DEMO_TRANSACTIONS = [
  {
    id: "TXN-89421",
    user_id: "demo-user-cresox-01",
    type: "deposit",
    amount: 2500000,
    status: "verified",
    counterparty_name: "HDFC Bank Settlement",
    note: "Capital Inflow via RTGS",
    created_at: "2026-02-01T10:00:00Z",
    blockchain_hash: "a4f892c90e81b67f10e4a938c049b71a25d9c73e61845bf09d81a34e56b2c781",
  },
  {
    id: "TXN-89422",
    user_id: "demo-user-cresox-01",
    type: "purchase",
    amount: -1250000,
    status: "verified",
    counterparty_name: "Apex Infrastructure Fund",
    note: "Acquisition of Emerald Horizon Units",
    created_at: "2026-02-05T14:30:00Z",
    blockchain_hash: "b7218ef890d7c62b10f3a827c138b60a14e8c62d50734ae08c70a23d45a1b672",
  },
  {
    id: "TXN-89423",
    user_id: "demo-user-cresox-01",
    type: "deposit",
    amount: 1500000,
    status: "verified",
    counterparty_name: "ICICI Treasury Escrow",
    note: "Direct Fund Allocation",
    created_at: "2026-02-10T11:15:00Z",
    blockchain_hash: "c830a7d401e6b53a21e2a716c249b51b25f9c53e61845bf09d81a34e56b2c783",
  },
  {
    id: "TXN-89424",
    user_id: "demo-user-cresox-01",
    type: "purchase",
    amount: -850000,
    status: "verified",
    counterparty_name: "Greenfield Solar Ltd",
    note: "Solaris MegaPark Phase II Units",
    created_at: "2026-02-14T09:15:00Z",
    blockchain_hash: "d941b6c212f5a44932d1b605c350a42c36a8d44f72956cb10e92b45f67c3d894",
  },
  {
    id: "TXN-89425",
    user_id: "demo-user-cresox-01",
    type: "transfer",
    amount: 75000,
    status: "verified",
    counterparty_name: "Sovereign Heritage Trust",
    note: "Monthly Distribution Yield",
    created_at: "2026-02-16T12:00:00Z",
    blockchain_hash: "e052c5b123a4935843c0a594c461b33d47b9e35a83a67dc21fa3c56a78d4e9a5",
  },
  {
    id: "TXN-89426",
    user_id: "demo-user-cresox-01",
    type: "withdraw",
    amount: -500000,
    status: "verified",
    counterparty_name: "HDFC Bank Settlement",
    note: "Treasury Rebalancing Payout",
    created_at: "2026-02-17T15:45:00Z",
    blockchain_hash: "f163d4a034b3826754d9b483c572a24e58c0f26b94b78ed32ab4d67b89e5fa06",
  },
  {
    id: "TXN-89427",
    user_id: "demo-user-cresox-01",
    type: "purchase",
    amount: -680000,
    status: "verified",
    counterparty_name: "FinVantage Factoring",
    note: "Corporate Accounts Receivable Allocation",
    created_at: "2026-02-18T10:20:00Z",
    blockchain_hash: "0274e39f45c2717665e8c372c683b15f69d1a17c05c89fe43bc5e78c90f6ab17",
  },
  {
    id: "TXN-89428",
    user_id: "demo-user-cresox-01",
    type: "transfer",
    amount: 35000,
    status: "verified",
    counterparty_name: "Greenfield Solar Ltd",
    note: "Solar Farm Green Tariff Credit",
    created_at: "2026-02-19T08:00:00Z",
    blockchain_hash: "1385f28e56d1608576f7d261c794a06a70e2b08d16d90af54cd6f89da1a7bc28",
  },
];

// ── Demo Blockchain Hashes ──────────────────────────────────────

export const DEMO_HASH_RECORDS = [
  {
    id: 101,
    entity_type: "asset",
    entity_id: "prod-demo-01",
    sha256_hash: "8f7a93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c78",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: 102,
    entity_type: "token_purchase",
    entity_id: "ord-demo-01",
    sha256_hash: "b7218ef890d7c62b10f3a827c138b60a14e8c62d50734ae08c70a23d45a1b672",
    created_at: "2026-02-05T14:30:00Z",
  },
  {
    id: 103,
    entity_type: "wallet_transaction",
    entity_id: "TXN-89421",
    sha256_hash: "a4f892c90e81b67f10e4a938c049b71a25d9c73e61845bf09d81a34e56b2c781",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: 104,
    entity_type: "asset",
    entity_id: "prod-demo-02",
    sha256_hash: "c41e82b75d60e41f928c049b71a25d9c73e61845bf09d81a34e56b2c788f7a93",
    created_at: "2026-02-03T11:30:00Z",
  },
  {
    id: 105,
    entity_type: "token_purchase",
    entity_id: "ord-demo-02",
    sha256_hash: "d941b6c212f5a44932d1b605c350a42c36a8d44f72956cb10e92b45f67c3d894",
    created_at: "2026-02-14T09:15:00Z",
  },
  {
    id: 106,
    entity_type: "wallet_transaction",
    entity_id: "TXN-89423",
    sha256_hash: "c830a7d401e6b53a21e2a716c249b51b25f9c53e61845bf09d81a34e56b2c783",
    created_at: "2026-02-10T11:15:00Z",
  },
  {
    id: 107,
    entity_type: "token_transfer",
    entity_id: "TXN-89425",
    sha256_hash: "e052c5b123a4935843c0a594c461b33d47b9e35a83a67dc21fa3c56a78d4e9a5",
    created_at: "2026-02-16T12:00:00Z",
  },
  {
    id: 108,
    entity_type: "asset",
    entity_id: "prod-demo-03",
    sha256_hash: "71a25d9c73e61845bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b",
    created_at: "2026-02-05T09:15:00Z",
  },
  {
    id: 109,
    entity_type: "verification_approval",
    entity_id: "demo-user-cresox-01",
    sha256_hash: "5bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73e6184",
    created_at: "2026-01-16T14:20:00Z",
  },
  {
    id: 110,
    entity_type: "profile",
    entity_id: "demo-user-cresox-01",
    sha256_hash: "e61845bf09d81a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73",
    created_at: "2026-01-15T09:00:00Z",
  },
  {
    id: 111,
    entity_type: "wallet_transaction",
    entity_id: "TXN-89426",
    sha256_hash: "f163d4a034b3826754d9b483c572a24e58c0f26b94b78ed32ab4d67b89e5fa06",
    created_at: "2026-02-17T15:45:00Z",
  },
  {
    id: 112,
    entity_type: "asset",
    entity_id: "prod-demo-05",
    sha256_hash: "1a34e56b2c788f7a93c41e82b75d60e41f928c049b71a25d9c73e61845bf09d8",
    created_at: "2026-02-08T16:20:00Z",
  },
];

// ── Demo Notifications ──────────────────────────────────────────

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "Asset Verified on Chain",
    message: "Emerald Horizon Tower A Units verified with hash 8f7a...2c78",
    time: "10 min ago",
    read: false,
  },
  {
    id: "notif-02",
    title: "Dividend Yield Credited",
    message: "₹35,000 clean energy tariff credit received in your wallet.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notif-03",
    title: "KYC & Profile Approved",
    message: "Your investor profile has been fully validated and activated.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "notif-04",
    title: "Security Ledger Sync",
    message: "All 12 cryptographic signatures verified on state trie.",
    time: "2 days ago",
    read: true,
  },
];

// ── Demo Users for Dashboard Accounts ───────────────────────────

export const DEMO_RECENT_USERS = [
  { id: "usr-01", full_name: "Jonathan Demo", role: "Investor", created_at: "2026-01-15T09:00:00Z" },
  { id: "usr-02", full_name: "Ananya Sharma", role: "Verified Asset Sponsor", created_at: "2026-01-20T11:00:00Z" },
  { id: "usr-03", full_name: "Rajesh Malhotra", role: "Infrastructure Custodian", created_at: "2026-01-28T14:30:00Z" },
  { id: "usr-04", full_name: "Priya Venkatesh", role: "Renewable Energy Trustee", created_at: "2026-02-04T10:15:00Z" },
  { id: "usr-05", full_name: "Vikramaditya Singhania", role: "Heritage Vault Allocator", created_at: "2026-02-09T16:40:00Z" },
  { id: "usr-06", full_name: "Elena Rostova", role: "Institutional Allocator", created_at: "2026-02-14T08:20:00Z" },
];

// ── Dynamic State Getters & Mutators for Demo Mode ──────────────

export function getDemoWallet() {
  if (typeof window === "undefined") return INITIAL_DEMO_WALLET;
  const stored = localStorage.getItem(DEMO_WALLET_KEY);
  if (stored) {
    try {
      const balance = Number(stored);
      return { ...INITIAL_DEMO_WALLET, balance };
    } catch {
      // fallback
    }
  }
  return INITIAL_DEMO_WALLET;
}

export function updateDemoWalletBalance(delta) {
  if (typeof window === "undefined") return INITIAL_DEMO_WALLET.balance;
  const current = getDemoWallet().balance;
  const next = Math.max(0, current + delta);
  localStorage.setItem(DEMO_WALLET_KEY, String(next));
  return next;
}

export function getDemoProducts() {
  if (typeof window === "undefined") return INITIAL_DEMO_PRODUCTS;
  const stored = localStorage.getItem(DEMO_PRODUCTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return INITIAL_DEMO_PRODUCTS;
}

export function getDemoOrders() {
  if (typeof window === "undefined") return INITIAL_DEMO_ORDERS;
  const stored = localStorage.getItem(DEMO_ORDERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return INITIAL_DEMO_ORDERS;
}

export function getDemoTransactions() {
  if (typeof window === "undefined") return INITIAL_DEMO_TRANSACTIONS;
  const stored = localStorage.getItem(DEMO_TRANSACTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return INITIAL_DEMO_TRANSACTIONS;
}

export function addDemoOrder(product) {
  const orders = getDemoOrders();
  const newOrder = {
    id: `ord-demo-${Date.now().toString().slice(-4)}`,
    buyer_id: DEMO_USER.id,
    seller_id: product.seller_id || "seller-demo-apex",
    product_id: product.id,
    status: "completed",
    created_at: new Date().toISOString(),
    product: {
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    },
    buyer: { full_name: DEMO_PROFILE.full_name },
    seller: { full_name: product.seller?.full_name || "Verified Asset Partner" },
  };

  const updatedOrders = [newOrder, ...orders];
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(updatedOrders));
  }

  // Also debit wallet and append transaction
  updateDemoWalletBalance(-Number(product.price));
  addDemoTransaction({
    type: "purchase",
    amount: -Number(product.price),
    counterparty_name: product.seller?.full_name || "Asset Seller",
    note: `Purchase of ${product.title}`,
  });

  return newOrder;
}

export function addDemoTransaction({ type, amount, counterparty_name, note }) {
  const txs = getDemoTransactions();
  const newTx = {
    id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    user_id: DEMO_USER.id,
    type,
    amount,
    status: "verified",
    counterparty_name: counterparty_name || "CresoX Network Partner",
    note: note || "Ledger Transfer",
    created_at: new Date().toISOString(),
    blockchain_hash: "a" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2) + "78",
  };

  const updated = [newTx, ...txs];
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(updated));
  }
  return newTx;
}
