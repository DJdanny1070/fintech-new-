import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import "./MarketplacePreview.css";

const PRODUCTS = [
  {
    name: "Verified Asset Listing",
    seller: "CresoX Marketplace",
    price: "₹2,500",
    verified: true,
  },
  {
    name: "Portfolio Analytics Access",
    seller: "CresoX Marketplace",
    price: "₹4,000",
    verified: true,
  },
  {
    name: "Business Credit Report",
    seller: "CresoX Marketplace",
    price: "₹999",
    verified: true,
  },
  {
    name: "Compliance Support Pack",
    seller: "CresoX Marketplace",
    price: "₹3,200",
    verified: true,
  },
];

function MarketplacePreview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBuy = () => {
    if (!user) {
      navigate("/login", {
        state: {
          redirect: "/marketplace",
        },
      });
      return;
    }

    // Authenticated — continue to the full marketplace
    navigate("/dashboard/marketplace");
  };

  return (
    <section className="mp-preview" id="marketplace">
      <div className="mp-preview__container">
        <div className="mp-preview__header">
          <h2 className="mp-preview__title">Marketplace</h2>
          <p className="mp-preview__subtitle">
            Browse verified products and services from trusted sellers across the CresoX ecosystem.
          </p>
        </div>

        <div className="mp-preview__panel">
          <div className="mp-preview__search">
            <Search size={18} strokeWidth={1.75} className="mp-preview__search-icon" />
            <input
              type="search"
              className="mp-preview__search-input"
              placeholder="Search marketplace listings"
              readOnly
              aria-label="Search marketplace"
            />
          </div>

          <div className="mp-preview__table-head">
            <span>Product</span>
            <span>Seller</span>
            <span>Price</span>
            <span></span>
          </div>

          <ul className="mp-preview__list">
            {PRODUCTS.map((item) => (
              <li className="mp-preview__row" key={item.name}>
                <div className="mp-preview__product">
                  <span className="mp-preview__product-name">{item.name}</span>
                  {item.verified && (
                    <span className="mp-preview__verified">
                      <ShieldCheck size={11} strokeWidth={2} />
                      Verified
                    </span>
                  )}
                </div>
                <span className="mp-preview__seller">{item.seller}</span>
                <span className="mp-preview__price">{item.price}</span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm mp-preview__buy"
                  onClick={handleBuy}
                >
                  Buy
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default MarketplacePreview;
