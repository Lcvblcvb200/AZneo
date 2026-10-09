import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";
import bannerTeclados from "./assets/banner-teclados.png";
import bannerMouses from "./assets/banner-mouses.png";
import bannerHardwares from "./assets/banner-hardwares.png";
import bannerMonitores from "./assets/banner-monitores.png";

import logo from "./assets/logo-azneo-full.png";
import cartIcon from "./assets/cart-icon.png";

import {
  getProducts,
  searchProducts,
  addToCart,
  getAccessToken,
  logout,
  resolveImageUrl,
} from "./api.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const PRODUCTS_PER_PAGE = 15;

const CATEGORIES = [
  "Todos",
  "Teclados",
  "Mouses",
  "Hardwares",
  "Monitores",
  "Cadeiras",
  "Mesas",
];

const HERO_SLIDES = [
  {
    category: "Teclados",
    title: "TECLADOS",
    subtitle: "Precisão, resposta e desempenho para o seu setup.",
    buttonText: "Ver teclados",
    image: bannerTeclados,
  },
  {
    category: "Mouses",
    title: "MOUSES",
    subtitle: "Controle e precisão em cada movimento.",
    buttonText: "Ver mouses",
    image: bannerMouses,
  },
  {
    category: "Hardwares",
    title: "HARDWARES",
    subtitle: "Potência e desempenho para elevar sua máquina.",
    buttonText: "Ver hardwares",
    image: bannerHardwares,
  },
  {
    category: "Monitores",
    title: "MONITORES",
    subtitle: "Mais fluidez e imersão para o seu setup.",
    buttonText: "Ver monitores",
    image: bannerMonitores,
  },
];

function splitPrice(price) {
  const formatted = currencyFormatter.format(price);
  const lastComma = formatted.lastIndexOf(",");

  if (lastComma === -1) {
    return {
      integerPart: formatted,
      cents: "00",
    };
  }

  return {
    integerPart: formatted.slice(0, lastComma),
    cents: formatted.slice(lastComma + 1),
  };
}

function installmentValue(price, times = 12) {
  return currencyFormatter.format(price / times);
}

export default function CatalogPage({
  onRequireAuth,
  onProductSelect,
  onAddProduct,
  onOpenCart,
  onCartChange,
  cartCount = 0,
}) {
  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [heroIndex, setHeroIndex] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  const requireAuth = () => {
    logout();

    if (onRequireAuth) {
      onRequireAuth();
    } else {
      setNeedsAuth(true);
    }
  };

  /*
   * CARREGA O CATÁLOGO
   *
   * O backend agora retorna:
   *
   * {
   *   products: [],
   *   page: 1,
   *   limit: 15,
   *   total: 0,
   *   total_pages: 0
   * }
   */
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (!getAccessToken()) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getProducts(page, PRODUCTS_PER_PAGE);

        if (cancelled) return;

        /*
         * Proteção importante:
         * products precisa SEMPRE ser um array.
         */
        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : []
        );

        setPage(
          Number.isInteger(data?.page)
            ? data.page
            : page
        );

        setTotalPages(
          Number.isInteger(data?.total_pages)
            ? data.total_pages
            : 0
        );

        setTotalProducts(
          Number.isInteger(data?.total)
            ? data.total
            : 0
        );
      } catch (err) {
        if (cancelled) return;

        if (err.status === 401) {
          requireAuth();
        } else {
          setError(
            err.message ||
              "Erro ao carregar produtos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, onRequireAuth]);

  /*
   * BUSCA
   */
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
        const data = await searchProducts(
          searchTerm.trim()
        );

        /*
         * Mantém compatibilidade caso futuramente
         * a busca também seja paginada.
         */
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else if (Array.isArray(data?.products)) {
          setSearchResults(data.products);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        if (err.status === 404) {
          setSearchResults([]);
        } else if (err.status === 401) {
          requireAuth();
        } else {
          setSearchError(
            err.message ||
              "Erro ao pesquisar produtos."
          );
        }
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(handle);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  /*
   * MARCAS DA PÁGINA ATUAL
   */
  const currentHero = HERO_SLIDES[heroIndex];

useEffect(() => {
  const interval = setInterval(() => {
    setHeroIndex(
      (current) => (current + 1) % HERO_SLIDES.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);

const previousHero = () => {
  setHeroIndex((current) =>
    current === 0
      ? HERO_SLIDES.length - 1
      : current - 1
  );
};

const nextHero = () => {
  setHeroIndex(
    (current) => (current + 1) % HERO_SLIDES.length
  );
};

const openHeroCategory = (category) => {
  setSelectedCategory(category);

  setTimeout(() => {
    document
      .getElementById("catalog-products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, 50);
};

/*
 * Se houver busca ativa, usa resultado da busca.
 * Caso contrário, usa produtos da página atual.
 */
const baseList =
  searchResults !== null
    ? searchResults
    : products;

  /*
   * FILTROS E ORDENAÇÃO
   */
  const visibleProducts = useMemo(() => {
    let list = Array.isArray(baseList)
      ? [...baseList]
      : [];

    if (selectedCategory !== "Todos") {
    list = list.filter(
      (product) =>
        product.category === selectedCategory
  );
}

    if (sortBy === "price-asc") {
      list.sort(
        (a, b) =>
          Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-desc") {
      list.sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      );
    }

    return list;
  }, [
    baseList,
    selectedCategory,
    sortBy,
  ]);

  /*
   * VOLTA PARA O CATÁLOGO INICIAL
   */
  const resetCatalog = () => {
    setSearchTerm("");
    setSearchResults(null);
    setSelectedCategory("Todos");
    setSortBy("relevance");
    setPage(1);
  };

  const handleLogout = () => {
    logout();

    if (onRequireAuth) {
      onRequireAuth();
    } else {
      setNeedsAuth(true);
    }
  };

  /*
   * TROCA DE PÁGINA
   */
  const goToPreviousPage = () => {
    if (page <= 1 || loading) return;

    setPage((current) => current - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToNextPage = () => {
    if (
      page >= totalPages ||
      loading
    ) {
      return;
    }

    setPage((current) => current + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToPage = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === page ||
      loading
    ) {
      return;
    }

    setPage(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showGrid =
    !loading &&
    !needsAuth &&
    !error &&
    products.length > 0;

  /*
   * Paginação aparece somente no catálogo normal.
   * Durante uma pesquisa, não mostramos os controles
   * da paginação do catálogo.
   */
  const showPagination =
    showGrid &&
    searchResults === null &&
    totalPages > 1;

  return (
    <div className="az-catalog">
      <div className="az-top-line" />

      <header className="az-topbar">
        <div className="az-topbar-row">
          <button
            type="button"
            className="az-topbar-logo-btn"
            onClick={resetCatalog}
            aria-label="Voltar ao catálogo inicial"
          >
            <img
              src={logo}
              alt="AZNEO"
              className="az-topbar-logo"
            />
          </button>

          <div className="az-topbar-search">
            <svg
              viewBox="0 0 24 24"
              className="az-search-icon"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />

              <line
                x1="16.5"
                y1="16.5"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="text"
              className="form-control"
              placeholder="O que você está procurando?"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          {!loading &&
            !error &&
            !needsAuth && (
              <div className="az-topbar-count mono">
                {searching
                  ? "BUSCANDO..."
                  : searchResults !== null
                  ? `${visibleProducts.length} ${
                      visibleProducts.length === 1
                        ? "PRODUTO"
                        : "PRODUTOS"
                    }`
                  : `${totalProducts} ${
                      totalProducts === 1
                        ? "PRODUTO"
                        : "PRODUTOS"
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

          {!needsAuth && onOpenCart && (
            <button
              type="button"
              className="az-cart-btn"
              onClick={onOpenCart}
              aria-label="Ver carrinho"
            >
              <img src={cartIcon} alt="" />

              {cartCount > 0 && (
                <span className="az-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {!needsAuth && (
            <button
              type="button"
              className="az-logout-btn"
              onClick={handleLogout}
              aria-label="Sair da conta"
              title="Sair"
            >
              <svg
                className="az-logout-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M10 5H6.5C5.67 5 5 5.67 5 6.5V17.5C5 18.33 5.67 19 6.5 19H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M14 8L18 12L14 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </div>

        {!loading &&
          !needsAuth &&
          !error &&
          products.length > 0 && (
            <div className="az-category-row">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`az-category-button ${
                    selectedCategory === category
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  <CategoryIcon category={category} />
                  <span>{category}</span>
                </button>
              ))}
            </div>
          )}
      </header>

      <section className="az-category-hero">
  <div
    className="az-category-hero-slide"
    key={currentHero.category}
    onClick={() =>
      openHeroCategory(currentHero.category)
    }
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        openHeroCategory(currentHero.category);
      }
    }}
  >
    <img
      src={currentHero.image}
      alt={currentHero.category}
      className="az-category-hero-image"
    />

    <div className="az-category-hero-overlay" />

    <div className="az-category-hero-content">
      <span className="az-category-hero-kicker mono">
        EXPLORE A CATEGORIA
      </span>

      <h1>{currentHero.title}</h1>

      <p>{currentHero.subtitle}</p>

      <button
        type="button"
        className="btn az-category-hero-button"
        onClick={(e) => {
          e.stopPropagation();
          openHeroCategory(currentHero.category);
        }}
      >
        {currentHero.buttonText}
        <span>→</span>
      </button>
    </div>
  </div>

  <button
    type="button"
    className="az-hero-arrow az-hero-arrow-left"
    onClick={previousHero}
    aria-label="Banner anterior"
  >
    ‹
  </button>

  <button
    type="button"
    className="az-hero-arrow az-hero-arrow-right"
    onClick={nextHero}
    aria-label="Próximo banner"
  >
    ›
  </button>

  <div className="az-hero-dots">
    {HERO_SLIDES.map((slide, index) => (
      <button
        key={slide.category}
        type="button"
        className={`az-hero-dot ${
          index === heroIndex ? "active" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setHeroIndex(index);
        }}
        aria-label={`Mostrar ${slide.category}`}
      />
    ))}
  </div>
</section>

      <main
          className="az-catalog-main"
          id="catalog-products"
        >
        <div className="az-catalog-heading">
          <h1 className="az-catalog-title">
            Todos os produtos
          </h1>

          {!loading &&
            !needsAuth &&
            !error &&
            products.length > 0 && (
              <select
                className="form-control az-sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="relevance">
                  Mais relevantes
                </option>

                <option value="price-asc">
                  Menor preço
                </option>

                <option value="price-desc">
                  Maior preço
                </option>
              </select>
            )}
        </div>

        {loading && <ProductGridSkeleton />}

        {!loading && needsAuth && (
          <div className="az-catalog-state">
            <div className="az-empty-state">
              <p className="az-sub mb-3">
                Você precisa entrar na sua conta
                para ver o catálogo.
              </p>

              {onRequireAuth && (
                <button
                  className="btn az-btn"
                  onClick={onRequireAuth}
                >
                  Ir para o login
                </button>
              )}
            </div>
          </div>
        )}

        {!loading &&
          !needsAuth &&
          error && (
            <div className="az-catalog-state">
              <div className="az-error-box mono">
                {error}
              </div>
            </div>
          )}

        {!loading &&
          !needsAuth &&
          !error &&
          products.length === 0 && (
            <div className="az-catalog-state">
              <p className="az-sub mb-0">
                Nenhum produto cadastrado ainda.
              </p>
            </div>
          )}

        {showGrid && searchError && (
          <div className="az-catalog-state">
            <div className="az-error-box mono">
              {searchError}
            </div>
          </div>
        )}

        {showGrid &&
          !searchError &&
          visibleProducts.length === 0 && (
            <div className="az-catalog-state">
              <p className="az-sub mb-0">
                Nenhum produto encontrado para
                essa busca.
              </p>
            </div>
          )}

        {showGrid &&
          !searchError &&
          visibleProducts.length > 0 && (
            <div className="az-product-grid">
              {visibleProducts.map(
                (product) => (
                  <ProductCard
                    key={
                      product.id_product ??
                      product.barcode
                    }
                    product={product}
                    onSelect={
                      onProductSelect
                    }
                    onCartChange={
                      onCartChange
                    }
                  />
                )
              )}
            </div>
          )}

        {showPagination && (
          <div className="az-pagination">
            <button
              type="button"
              className="az-pagination-btn"
              disabled={page === 1 || loading}
              onClick={goToPreviousPage}
            >
              ← Anterior
            </button>

            <div className="az-pagination-pages">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`az-pagination-number ${
                    page === pageNumber
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    goToPage(pageNumber)
                  }
                  disabled={loading}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="az-pagination-btn"
              disabled={
                page === totalPages ||
                loading
              }
              onClick={goToNextPage}
            >
              Próxima →
            </button>
          </div>
        )}

        {showPagination && (
          <div className="az-pagination-info mono">
            Página {page} de {totalPages}
          </div>
        )}
      </main>
    </div>
  );

function CategoryIcon({ category }) {
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (category === "Todos") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (category === "Teclados") {
    return (
      <svg {...commonProps}>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M5 10h1M8 10h1M11 10h1M14 10h1M17 10h1" />
        <path d="M5 13h1M8 13h1M11 13h1M14 13h1M17 13h1" />
        <path d="M7 16h10" />
      </svg>
    );
  }

  if (category === "Mouses") {
    return (
      <svg {...commonProps}>
        <rect x="6" y="2" width="12" height="20" rx="6" />
        <path d="M12 2v6" />
      </svg>
    );
  }

  if (category === "Hardwares") {
    return (
      <svg {...commonProps}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3" />
        <path d="M1 9h3M1 15h3M20 9h3M20 15h3" />
        <rect x="9" y="9" width="6" height="6" />
      </svg>
    );
  }

  if (category === "Monitores") {
    return (
      <svg {...commonProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  }

  if (category === "Cadeiras") {
    return (
      <svg {...commonProps}>
        <path d="M7 3h10v10H7z" />
        <path d="M5 13h14v4H5z" />
        <path d="M7 17v4M17 17v4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M3 7h18M5 7v13M19 7v13" />
      <path d="M2 4h20v3H2z" />
    </svg>
  );
}

function ProductCard({
  product,
  onSelect,
  onCartChange,
}) {
  const outOfStock =
    Number(product.stock) <= 0;

  const lowStock =
    !outOfStock &&
    Number(product.stock) <= 3;

  const { integerPart, cents } =
    splitPrice(Number(product.price));

  const [adding, setAdding] =
    useState(false);

  const clickable = Boolean(
    product.slug && onSelect
  );

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    setAdding(true);

    try {
      const cart = await addToCart(
        product.id_product,
        1
      );

      if (onCartChange) {
        onCartChange(cart);
      }
    } catch (err) {
      window.alert(
        err.message ||
          "Não foi possível adicionar o produto ao carrinho."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!clickable) return;

    if (
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      onSelect(product.slug);
    }
  };

  return (
    <div
      className={`az-product-card ${
        clickable ? "clickable" : ""
      }`}
      onClick={
        clickable
          ? () =>
              onSelect(product.slug)
          : undefined
      }
      onKeyDown={handleKeyDown}
      role={
        clickable
          ? "button"
          : undefined
      }
      tabIndex={
        clickable
          ? 0
          : undefined
      }
    >
      <div className="az-product-image-wrap">
        {product.image_url ? (
          <img
            src={resolveImageUrl(
              product.image_url
            )}
            alt={product.product_name}
            className="az-product-image"
          />
        ) : (
          <div className="az-product-image-placeholder mono">
            SEM IMAGEM
          </div>
        )}

        <span
          className={`az-stock-badge mono ${
            outOfStock ? "out" : ""
          } ${
            lowStock ? "low" : ""
          }`}
        >
          <span className="az-stock-dot" />

          {outOfStock
            ? "ESGOTADO"
            : `${product.stock} EM ESTOQUE`}
        </span>
      </div>

      <div className="az-product-info">
        <div className="az-product-brand mono">
          {product.brand}
        </div>

        <h3 className="az-product-name">
          {product.product_name}
        </h3>

        <p className="az-product-desc">
          {product.description}
        </p>

        <div className="az-product-price-block">
          <div className="az-product-price">
            <span>{integerPart}</span>
            <sup>{cents}</sup>
          </div>

          {!outOfStock && (
            <div className="az-product-installments">
              em até 12x de{" "}
              {installmentValue(
                Number(product.price)
              )}{" "}
              sem juros
            </div>
          )}
        </div>

        <button
          className="btn az-btn az-product-btn"
          disabled={
            outOfStock ||
            adding
          }
          onClick={handleAddToCart}
        >
          {outOfStock
            ? "Indisponível"
            : adding
            ? "Adicionando..."
            : "Comprar"}
        </button>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="az-product-grid">
      {Array.from({
        length: PRODUCTS_PER_PAGE,
      }).map((_, i) => (
        <div
          className="az-product-card az-skeleton"
          key={i}
        >
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
}}