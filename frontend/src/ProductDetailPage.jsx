
import { useEffect, useId, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";

import logo from "./assets/logo-azneo-full.png";
import cartIcon from "./assets/cart-icon.png";

import {
  getProductBySlug,
  deleteProduct,
  addToCart,
  logout,
  resolveImageUrl,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "./api.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function installmentValue(price, times = 12) {
  return currencyFormatter.format(Number(price) / times);
}

/* Upload reutilizável: publicação e edição */
function ReviewImageUpload({ image, onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  function removeImage() {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="az-review-image-field">
      <label className="az-comment-label">
        Adicionar imagem
      </label>

      <div className="az-review-image-row">
        <label
          htmlFor={inputId}
          className="az-review-image-select"
        >
          <span className="az-review-image-plus">+</span>
          Selecionar imagem
        </label>

        <input
          ref={inputRef}
          id={inputId}
          className="az-review-image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            onChange(event.target.files?.[0] || null);
          }}
        />

        {preview && (
          <div className="az-review-image-preview">
            <img
              src={preview}
              alt="Prévia da imagem selecionada"
            />

            <button
              type="button"
              className="az-review-image-remove"
              onClick={removeImage}
              title="Remover imagem"
              aria-label="Remover imagem"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StarSelector({ value, onChange }) {
  return (
    <div className="az-star-selector">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`az-star ${star <= value ? "active" : ""}`}
          onClick={() => onChange(star)}
          aria-label={`${star} estrelas`}
          aria-pressed={star === value}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailPage({
  slug,
  profile,
  onBack,
  onEdit,
  onDeleted,
  onOpenCart,
  onCartChange,
  onRequireAuth,
  cartCount = 0,
}) {
  const [product, setProduct] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
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
        const data = await getProductBySlug(slug);

        if (cancelled) return;

        setProduct(data.product);
        setCommentsData(data.comments);
      } catch (err) {
        if (cancelled) return;

        if (err.status === 404) {
          setNotFound(true);
        } else if (err.status === 401) {
          logout();
          onRequireAuth?.();
        } else {
          setError(err.message || "Erro ao carregar produto.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (slug) loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, onRequireAuth]);

  return (
    <div className="az-catalog">
      <header className="az-topbar">
        <div className="az-topbar-row">
          <button
            type="button"
            className="az-topbar-logo-btn"
            onClick={onBack}
            aria-label="Voltar ao catálogo"
          >
            <img
              src={logo}
              alt="AZNEO"
              className="az-topbar-logo"
            />
          </button>

          <button
            type="button"
            className="az-back-link"
            onClick={onBack}
          >
            ← Voltar ao catálogo
          </button>

          {onOpenCart && (
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
        </div>
      </header>

      <main className="az-detail-main">
        {loading && <DetailSkeleton />}

        {!loading && notFound && (
          <div className="az-catalog-state">
            <div className="az-empty-state">
              <p className="az-sub mb-3">
                Esse produto não foi encontrado.
              </p>
              <button
                type="button"
                className="btn az-btn"
                onClick={onBack}
              >
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
          <ProductDetail
            product={product}
            commentsData={commentsData}
            profile={profile}
            onEdit={onEdit}
            onDeleted={onDeleted}
            onCartChange={onCartChange}
          />
        )}
      </main>
    </div>
  );
}

function ProductDetail({
  product,
  commentsData,
  profile,
  onEdit,
  onDeleted,
  onCartChange,
}) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  async function handleAddToCart() {
    setAdding(true);
    setAddError("");

    try {
      const cart = await addToCart(product.id_product, 1);
      onCartChange?.(cart);
    } catch (err) {
      setAddError(err.message || "Erro ao adicionar ao carrinho.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Tem certeza que quer excluir "${product.product_name}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteProduct(product.id_product);
      onDeleted?.();
    } catch (err) {
      setDeleteError(err.message || "Erro ao excluir produto.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="az-detail-card">
        <div className="az-detail-image-wrap">
          {product.image_url ? (
            <img
              src={resolveImageUrl(product.image_url)}
              alt={product.product_name}
              className="az-detail-image"
            />
          ) : (
            <div className="az-product-image-placeholder mono">
              SEM IMAGEM
            </div>
          )}
        </div>

        <div className="az-detail-info">
          <div className="az-product-brand mono">
            {product.brand}
          </div>

          <h1 className="az-detail-title">
            {product.product_name}
          </h1>

          <span
            className={`az-stock-badge az-detail-stock mono ${
              outOfStock ? "out" : ""
            } ${lowStock ? "low" : ""}`}
          >
            <span className="az-stock-dot" />
            {outOfStock
              ? "ESGOTADO"
              : `${product.stock} EM ESTOQUE`}
          </span>

          <div className="az-detail-price">
            {currencyFormatter.format(Number(product.price))}
          </div>

          {!outOfStock && (
            <div className="az-product-installments">
              em até 12x de{" "}
              {installmentValue(product.price)} sem juros
            </div>
          )}

          <p className="az-detail-desc">
            {product.description}
          </p>

          <button
            type="button"
            className="btn az-btn az-detail-btn"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
          >
            {outOfStock
              ? "Indisponível"
              : adding
              ? "Adicionando..."
              : "Comprar"}
          </button>

          {addError && (
            <div className="az-error-box mono mt-2">
              {addError}
            </div>
          )}

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
            <div className="az-error-box mono mt-2">
              {deleteError}
            </div>
          )}
        </div>
      </div>

      <CommentsSection
        productId={product.id_product}
        initialComments={commentsData}
        profile={profile}
      />
    </>
  );
}

function CommentsSection({
  productId,
  initialComments,
  profile,
}) {
  const [comments, setComments] = useState(
    initialComments?.comments || []
  );
  const [page, setPage] = useState(
    initialComments?.page || 1
  );
  const [totalPages, setTotalPages] = useState(
    initialComments?.total_pages || 0
  );

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setComments(initialComments?.comments || []);
    setPage(initialComments?.page || 1);
    setTotalPages(initialComments?.total_pages || 0);
  }, [initialComments]);

  async function loadComments(targetPage = 1) {
    setLoading(true);
    setError("");

    try {
      const data = await getComments(
        productId,
        targetPage,
        15
      );

      setComments(data.comments || []);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message || "Erro ao carregar avaliações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      setError("Escreva seu comentário.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("content", content.trim());
      formData.append("rating", String(rating));

      if (image) {
        formData.append("image", image);
      }

      await createComment(productId, formData);

      setContent("");
      setRating(5);
      setImage(null);

      await loadComments(1);
    } catch (err) {
      setError(err.message || "Erro ao publicar avaliação.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="az-comments-section">
      <div className="az-comments-header">
        <div>
          <div className="mono az-comments-kicker">
            AVALIAÇÕES
          </div>
          <h2>Opiniões sobre o produto</h2>
        </div>
      </div>

      {profile && (
        <form
          className="az-comment-form"
          onSubmit={handleSubmit}
        >
          <label className="az-comment-label">
            Sua avaliação
          </label>

          <StarSelector
            value={rating}
            onChange={setRating}
          />

          <label className="az-comment-label">
            Comentário
          </label>

          <textarea
            className="az-comment-textarea"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Conte sua experiência com este produto..."
            rows={4}
          />

          <ReviewImageUpload
            image={image}
            onChange={setImage}
          />

          <button
            type="submit"
            className="btn az-btn"
            disabled={posting}
          >
            {posting ? "Publicando..." : "Postar avaliação"}
          </button>
        </form>
      )}

      {error && (
        <div className="az-error-box mono mt-3">
          {error}
        </div>
      )}

      {loading ? (
        <p className="az-sub">Carregando avaliações...</p>
      ) : comments.length === 0 ? (
        <div className="az-comments-empty">
          Este produto ainda não possui avaliações.
        </div>
      ) : (
        <div className="az-comments-list">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id_comment}
              comment={comment}
              currentUserId={profile?.id_user}
              onChanged={() => loadComments(page)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="az-comments-pagination">
          <button
            type="button"
            className="az-btn-ghost"
            disabled={page <= 1 || loading}
            onClick={() => loadComments(page - 1)}
          >
            Anterior
          </button>

          <span className="mono">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            className="az-btn-ghost"
            disabled={page >= totalPages || loading}
            onClick={() => loadComments(page + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </section>
  );
}

function CommentCard({
  comment,
  currentUserId,
  onChanged,
}) {
  const isOwner =
    currentUserId != null &&
    comment.user?.id_user === currentUserId;

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [rating, setRating] = useState(
    Number(comment.rating)
  );
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    if (!content.trim()) {
      setError("O comentário não pode ficar vazio.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("content", content.trim());
      formData.append("rating", String(rating));

      if (image) {
        formData.append("image", image);
      }

      await updateComment(comment.id_comment, formData);

      setEditing(false);
      setImage(null);
      await onChanged();
    } catch (err) {
      setError(err.message || "Erro ao salvar avaliação.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Deseja excluir esta avaliação?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteComment(comment.id_comment);
      await onChanged();
    } catch (err) {
      setError(err.message || "Erro ao excluir avaliação.");
      setDeleting(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setContent(comment.content);
    setRating(Number(comment.rating));
    setImage(null);
    setError("");
  }

  if (editing) {
    return (
      <article className="az-comment-card">
        <StarSelector
          value={rating}
          onChange={setRating}
        />

        <textarea
          className="az-comment-textarea"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          rows={4}
        />

        <ReviewImageUpload
          image={image}
          onChange={setImage}
        />

        {error && (
          <div className="az-error-box mono">
            {error}
          </div>
        )}

        <div className="az-comment-actions">
          <button
            type="button"
            className="btn az-btn"
            disabled={saving}
            onClick={handleUpdate}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            className="az-btn-ghost"
            disabled={saving}
            onClick={handleCancel}
          >
            Cancelar
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="az-comment-card">
      <div className="az-comment-top">
        <strong>
          {comment.user?.name || "Usuário"}
        </strong>

        <span
          className="az-comment-rating"
          aria-label={`${comment.rating} estrelas`}
        >
          {"★".repeat(
            Math.max(
              0,
              Math.min(5, Math.round(Number(comment.rating)))
            )
          )}
        </span>
      </div>

      <p>{comment.content}</p>

      {comment.image_url && (
        <img
          className="az-comment-image"
          src={resolveImageUrl(comment.image_url)}
          alt="Imagem enviada na avaliação"
        />
      )}

      {isOwner && (
        <div className="az-comment-actions">
          <button
            type="button"
            className="az-btn-ghost"
            onClick={() => setEditing(true)}
          >
            Editar
          </button>

          <button
            type="button"
            className="az-btn-ghost danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      )}

      {error && (
        <div className="az-error-box mono">
          {error}
        </div>
      )}
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="az-detail-card az-skeleton">
      <div className="az-detail-image-wrap az-skeleton-block" />

      <div className="az-detail-info">
        <div className="az-skeleton-line short" />

        <div
          className="az-skeleton-line medium"
          style={{ height: "1.6rem" }}
        />

        <div className="az-skeleton-line short" />
        <div className="az-skeleton-line" />
        <div className="az-skeleton-line" />
        <div className="az-skeleton-line medium" />
      </div>
    </div>
  );
}
//vc parou nos comentários, continue no chatgpt