import { useState } from "react";
import { DEALER_PRODUCTS } from "../constants/dealerProducts";

/**
 * ProductSelector — searchable multi-select chip grid for dealer products.
 */
const ProductSelector = ({ value = [], onChange, error }) => {
  const [search, setSearch] = useState("");

  const filtered = DEALER_PRODUCTS.filter((product) =>
    product.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (product) => {
    if (value.includes(product)) {
      onChange(value.filter((p) => p !== product));
    } else {
      onChange([...value, product]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="input-label mb-0">Select Products</span>
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {value.length} selected
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Choose the agricultural products you deal in.
      </p>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-3 text-sm py-2"
        aria-label="Search products"
      />

      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto rounded-xl border border-surface-200 bg-surface-50 p-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-2 w-full text-center">No products found.</p>
        ) : (
          filtered.map((product) => (
            <button
              key={product}
              type="button"
              onClick={() => toggle(product)}
              aria-pressed={value.includes(product)}
              className={`chip ${value.includes(product) ? "chip-selected" : "chip-unselected"}`}
            >
              {value.includes(product) && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {product}
            </button>
          ))
        )}
      </div>

      {value.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
};

export default ProductSelector;
