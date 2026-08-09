import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";
import logo from "./assets/logo-azneo-full.png";
import {
  getProducts,
  searchProducts,
  getAccessToken,
  logout,
  resolveImageUrl,
} from "./api.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Splits "R$ 1.599,99" into { integerPart: "R$ 1.599", cents: "99" } so
// the price can be rendered with a bigger integer part and smaller
// cents, like most e-commerce listings do.
function splitPrice(price) {
  const formatted = currencyFormatter.format(price);
  const lastComma = formatted.lastIndexOf(",");
  if (lastComma === -1) return { integerPart: formatted, cents: "00" };
  return {
    integerPart: formatted.slice(0, lastComma),
    cents: formatted.slice(lastComma + 1),
  };
}

function installmentValue(price, times = 12) {
  return currencyFormatter.format(price / times);
}

export default function CatalogPage({ onRequireAuth, onProductSelect, onAddProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = no active search
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("Todos");
  const [sortBy, setSortBy] = useState("relevance");

  const requireAuth = () => {
    logout();
    if (onRequireAuth) {
      onRequireAuth();
    } else {
      setNeedsAuth(true);
    }
  };

  // Initial catalog load
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      // This screen requires a logged-in user (GET /products/view is
      // protected by token_verify on the backend).
      if (!getAccessToken()) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          // Token is missing/invalid/expired: clear it and send the
          // user straight to the login screen instead of showing an
          // error message.
          requireAuth();
        } else {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRequireAuth]);

  // Search-as-you-type against the real backend, debounced so it
  // doesn't fire a request on every keystroke.
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    const handle = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const data = await searchProducts(searchTerm.trim());
        setSearchResults(data);
      } catch (err) {
        if (err.status === 404) {
          // Backend raises 404 when nothing matches — treat as an
          // empty result list, not as an error.
          setSearchResults([]);
        } else if (err.status === 401) {
          requireAuth();
        } else {
          setSearchError(err.message);
        }
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const brands = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return ["Todos", ...unique.sort()];
  }, [products]);

  const baseList = searchResults ?? products;

  const visibleProducts = useMemo(() => {
    let list = baseList;

    if (selectedBrand !== "Todos") {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [baseList, selectedBrand, sortBy]);

  const showGrid = !loading && !needsAuth && !error && products.length > 0;

  return (
    <div className="az-catalog">
      <header className="az-topbar">
        <img src={logo} alt="AZNEO" className="az-topbar-logo" />
        <div className="az-topbar-search">
          <svg viewBox="0 0 24 24" className="az-search-icon" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="form-control"
            placeholder="O que você está procurando?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {!loading && !error && !needsAuth && (
          <div className="az-topbar-count mono">
            {searching
              ? "BUSCANDO..."
              : `${visibleProducts.length} ${
                  visibleProducts.length === 1 ? "PRODUTO" : "PRODUTOS"
                }`}
          </div>
        )}
        {!needsAuth && onAddProduct && (
          <button
            type="button"
            className="btn az-topbar-add"
            onClick={onAddProduct}
          >
            + Adicionar produto
          </button>
        )}
      </header>

      {/* promo strip — decorative, same brand identity as the login screen */}
      <div className="az-promo-strip">
        <span className="az-promo-dot" />
        Bem-vindo ao AZNEO — compre e venda eletrônicos com confiança.
      </div>

      <main className="az-catalog-main">
        <div className="az-catalog-heading">
          <h1 className="az-catalog-title">Catálogo</h1>

          {!loading && !needsAuth && !error && products.length > 0 && (
            <select
              className="form-control az-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Mais relevantes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          )}
        </div>

        {!loading && !needsAuth && !error && products.length > 0 && (
          <div className="az-chip-row">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={`az-chip ${selectedBrand === brand ? "active" : ""}`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {loading && <ProductGridSkeleton />}

        {!loading && needsAuth && (
          <div className="az-catalog-state">
            <div className="az-empty-state">
              <p className="az-sub mb-3">
                Você precisa entrar na sua conta para ver o catálogo.
              </p>
              {onRequireAuth && (
                <button className="btn az-btn" onClick={onRequireAuth}>
                  Ir para o login
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !needsAuth && error && (
          <div className="az-catalog-state">
            <div className="az-error-box mono">{error}</div>
          </div>
        )}

        {!loading && !needsAuth && !error && products.length === 0 && (
          <div className="az-catalog-state">
            <p className="az-sub mb-0">Nenhum produto cadastrado ainda.</p>
          </div>
        )}

        {showGrid && searchError && (
          <div className="az-catalog-state">
            <div className="az-error-box mono">{searchError}</div>
          </div>
        )}

        {showGrid && !searchError && visibleProducts.length === 0 && (
          <div className="az-catalog-state">
            <p className="az-sub mb-0">
              Nenhum produto encontrado para essa busca.
            </p>
          </div>
        )}

        {showGrid && !searchError && visibleProducts.length > 0 && (
          <div className="az-product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id_product}
                product={product}
                onSelect={onProductSelect}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, onSelect }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const { integerPart, cents } = splitPrice(product.price);
  // The catalog list route doesn't return `slug` yet — once ProductOut
  // includes it, the card becomes clickable automatically.
  const clickable = Boolean(product.slug && onSelect);

  return (
    <div
      className={`az-product-card ${clickable ? "clickable" : ""}`}
      onClick={clickable ? () => onSelect(product.slug) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="az-product-image-wrap">
        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.product_name}
            className="az-product-image"
          />
        ) : (
          <div className="az-product-image-placeholder mono">SEM IMAGEM</div>
        )}
        <span
          className={`az-stock-badge mono ${outOfStock ? "out" : ""} ${
            lowStock ? "low" : ""
          }`}
        >
          <span className="az-stock-dot" />
          {outOfStock ? "ESGOTADO" : `${product.stock} EM ESTOQUE`}
        </span>
      </div>

      <div className="az-product-info">
        <div className="az-product-brand mono">{product.brand}</div>
        <h3 className="az-product-name">{product.product_name}</h3>
        <p className="az-product-desc">{product.description}</p>

        <div className="az-product-price-block">
          <div className="az-product-price">
            <span>{integerPart}</span>
            <sup>{cents}</sup>
          </div>
          {!outOfStock && (
            <div className="az-product-installments">
              em até 12x de {installmentValue(product.price)} sem juros
            </div>
          )}
        </div>

        <button className="btn az-btn az-product-btn" disabled={outOfStock}>
          {outOfStock ? "Indisponível" : "Comprar"}
        </button>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="az-product-grid">
      {Array.from({ length: 15 }).map((_, i) => (
        <div className="az-product-card az-skeleton" key={i}>
          <div className="az-product-image-wrap az-skeleton-block" />
          <div className="az-product-info">
            <div className="az-skeleton-line short" />
            <div className="az-skeleton-line" />
            <div className="az-skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}
