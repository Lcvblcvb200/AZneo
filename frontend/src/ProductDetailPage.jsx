import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";
import logo from "./assets/logo-azneo-full.png";
import { getProductBySlug, deleteProduct, resolveImageUrl } from "./api.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function installmentValue(price, times = 12) {
  return currencyFormatter.format(price / times);
}

export default function ProductDetailPage({ slug, onBack, onEdit, onDeleted }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setNotFound(false);
      try {
        // Public route — GET /products/product/{slug}, no token needed.
        const data = await getProductBySlug(slug);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (slug) loadProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="az-catalog">
      <header className="az-topbar">
        <img src={logo} alt="AZNEO" className="az-topbar-logo" />
        <button type="button" className="az-back-link" onClick={onBack}>
          ← Voltar ao catálogo
        </button>
      </header>

      <main className="az-detail-main">
        {loading && <DetailSkeleton />}

        {!loading && notFound && (
          <div className="az-catalog-state">
            <div className="az-empty-state">
              <p className="az-sub mb-3">Esse produto não foi encontrado.</p>
              <button className="btn az-btn" onClick={onBack}>
                Voltar ao catálogo
              </button>
            </div>
          </div>
        )}

        {!loading && !notFound && error && (
          <div className="az-catalog-state">
            <div className="az-error-box mono">{error}</div>
          </div>
        )}

        {!loading && !notFound && !error && product && (
          <ProductDetail product={product} onEdit={onEdit} onDeleted={onDeleted} />
        )}
      </main>
    </div>
  );
}

function ProductDetail({ product, onEdit, onDeleted }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que quer excluir "${product.product_name}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProduct(product.id_product);
      if (onDeleted) onDeleted();
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="az-detail-card">
      <div className="az-detail-image-wrap">
        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.product_name}
            className="az-detail-image"
          />
        ) : (
          <div className="az-product-image-placeholder mono">SEM IMAGEM</div>
        )}
      </div>

      <div className="az-detail-info">
        <div className="az-product-brand mono">{product.brand}</div>
        <h1 className="az-detail-title">{product.product_name}</h1>

        <span
          className={`az-stock-badge az-detail-stock mono ${
            outOfStock ? "out" : ""
          } ${lowStock ? "low" : ""}`}
        >
          <span className="az-stock-dot" />
          {outOfStock ? "ESGOTADO" : `${product.stock} EM ESTOQUE`}
        </span>

        <div className="az-detail-price">
          {currencyFormatter.format(product.price)}
        </div>
        {!outOfStock && (
          <div className="az-product-installments">
            em até 12x de {installmentValue(product.price)} sem juros
          </div>
        )}

        <p className="az-detail-desc">{product.description}</p>

        <button className="btn az-btn az-detail-btn" disabled={outOfStock}>
          {outOfStock ? "Indisponível" : "Comprar"}
        </button>

        {(onEdit || onDeleted) && (
          <div className="az-detail-actions">
            {onEdit && (
              <button
                type="button"
                className="az-btn-ghost"
                onClick={() => onEdit(product)}
              >
                Editar
              </button>
            )}
            {onDeleted && (
              <button
                type="button"
                className="az-btn-ghost danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            )}
          </div>
        )}
        {deleteError && (
          <div className="az-error-box mono mt-2">{deleteError}</div>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="az-detail-card az-skeleton">
      <div className="az-detail-image-wrap az-skeleton-block" />
      <div className="az-detail-info">
        <div className="az-skeleton-line short" />
        <div className="az-skeleton-line medium" style={{ height: "1.6rem" }} />
        <div className="az-skeleton-line short" />
        <div className="az-skeleton-line" />
        <div className="az-skeleton-line" />
        <div className="az-skeleton-line medium" />
      </div>
    </div>
  );
}
