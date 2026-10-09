import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";
import cartIcon from "./assets/cart-icon.png";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  resolveImageUrl,
} from "./api.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function CartPage({ onBack, onCartChange, onRequireAuth }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingItemId, setPendingItemId] = useState(null);

  const loadCart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCart();
      setCart(data);
      if (onCartChange) onCartChange(data);
    } catch (err) {
      if (err.status === 401) {
        if (onRequireAuth) onRequireAuth();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    setPendingItemId(itemId);
    try {
      const data = await updateCartItem(itemId, quantity);
      setCart(data);
      if (onCartChange) onCartChange(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setPendingItemId(itemId);
    try {
      const data = await removeCartItem(itemId);
      setCart(data);
      if (onCartChange) onCartChange(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingItemId(null);
    }
  };

  const items = cart?.items || [];

  return (
    <div className="az-catalog">
      <header className="az-topbar">
        <div className="az-topbar-row">
          <button type="button" className="az-back-link" onClick={onBack}>
            ← Continuar comprando
          </button>
        </div>
      </header>

      <main className="az-cart-main">
        <h1 className="az-catalog-title mb-4">Meu carrinho</h1>

        {loading && <CartSkeleton />}

        {!loading && error && (
          <div className="az-catalog-state">
            <div className="az-error-box mono">{error}</div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="az-catalog-state">
            <div className="az-empty-state">
              <img src={cartIcon} alt="" className="az-cart-empty-icon" />
              <p className="az-sub mb-3">Seu carrinho está vazio.</p>
              <button className="btn az-btn" onClick={onBack}>
                Ver catálogo
              </button>
            </div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="az-cart-layout">
            <div className="az-cart-items">
              {items.map((item) => (
                <CartItemRow
                  key={item.id_item}
                  item={item}
                  pending={pendingItemId === item.id_item}
                  onQuantityChange={(qty) =>
                    handleQuantityChange(item.id_item, qty)
                  }
                  onRemove={() => handleRemove(item.id_item)}
                />
              ))}
            </div>

            <div className="az-cart-summary">
              <div className="az-cart-summary-title">Resumo</div>
              <div className="az-cart-summary-row">
                <span>Total</span>
                <span className="az-cart-summary-total">
                  {currencyFormatter.format(cart.total)}
                </span>
              </div>
              <button className="btn az-btn w-100 mt-3">
                Finalizar compra
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CartItemRow({ item, pending, onQuantityChange, onRemove }) {
  const product = item.product;
  const subtotal = item.unit_price * item.quantity;

  return (
    <div className={`az-cart-item ${pending ? "pending" : ""}`}>
      <div className="az-cart-item-image">
        {product?.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.product_name}
          />
        ) : (
          <div className="az-product-image-placeholder mono">SEM IMAGEM</div>
        )}
      </div>

      <div className="az-cart-item-info">
        <div className="az-product-brand mono">{product?.brand}</div>
        <div className="az-cart-item-name">{product?.product_name}</div>
        <div className="az-cart-item-unit-price">
          {currencyFormatter.format(item.unit_price)} un.
        </div>
      </div>

      <div className="az-cart-item-qty">
        <button
          type="button"
          className="az-qty-btn"
          disabled={pending || item.quantity <= 1}
          onClick={() => onQuantityChange(item.quantity - 1)}
        >
          −
        </button>
        <span className="mono">{item.quantity}</span>
        <button
          type="button"
          className="az-qty-btn"
          disabled={pending}
          onClick={() => onQuantityChange(item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="az-cart-item-subtotal">
        {currencyFormatter.format(subtotal)}
      </div>

      <button
        type="button"
        className="az-cart-item-remove"
        disabled={pending}
        onClick={onRemove}
        aria-label="Remover item"
      >
        ×
      </button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="az-cart-items">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="az-cart-item az-skeleton" key={i}>
          <div className="az-cart-item-image az-skeleton-block" />
          <div className="az-cart-item-info">
            <div className="az-skeleton-line short" />
            <div className="az-skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}
