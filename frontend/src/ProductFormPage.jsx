import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";
import logo from "./assets/logo-azneo-full.png";
import { createProduct, updateProduct, resolveImageUrl } from "./api.js";

function Field({ label, id, type = "text", ...props }) {
  const [focused, setFocused] = useState(false);
  const Tag = type === "textarea" ? "textarea" : "input";

  return (
    <div className={`az-field-group ${focused ? "focused" : ""}`}>
      <label className="az-field-label" htmlFor={id}>
        <span className="node" />
        {label}
      </label>
      <Tag
        id={id}
        type={type === "textarea" ? undefined : type}
        className="form-control"
        onFocus={() => setFocused(true)}
        onBlur={(e) => setFocused(Boolean(e.target.value))}
        {...props}
      />
    </div>
  );
}

export default function ProductFormPage({ mode = "create", product, onDone, onCancel }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: product?.product_name || "",
    description: product?.description || "",
    brand: product?.brand || "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    isEdit ? resolveImageUrl(product?.image_url) : null
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (imageFile) URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile, previewUrl]);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      return;
    }
    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.brand.trim() || !form.description.trim()) {
      setError("Preencha nome, marca e descrição.");
      return;
    }
    if (Number(form.price) <= 0) {
      setError("Informe um preço válido.");
      return;
    }
    if (Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
      setError("Informe uma quantidade de estoque válida.");
      return;
    }
    if (!isEdit && !imageFile) {
      setError("Selecione uma imagem para o produto.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("brand", form.brand.trim());
      formData.append("price", Number(form.price));
      formData.append("stock", Number(form.stock));
      if (imageFile) formData.append("image", imageFile);

      const result = isEdit
        ? await updateProduct(product.id_product, formData)
        : await createProduct(formData);

      if (onDone) onDone(result);
    } catch (err) {
      if (err.status === 409) {
        setError("Já existe um produto com esse nome.");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="az-catalog">
      <header className="az-topbar">
        <img src={logo} alt="AZNEO" className="az-topbar-logo" />
        <button type="button" className="az-back-link" onClick={onCancel}>
          ← Voltar
        </button>
      </header>

      <main className="az-detail-main">
        <div className="az-form-card">
          <div className="az-form-title">
            {isEdit ? "Editar produto" : "Adicionar produto"}
          </div>
          <div className="az-form-caption">
            {isEdit
              ? "Atualize as informações do produto."
              : "Preencha os dados do produto que você quer anunciar."}
          </div>

          {error && <div className="az-error-box mono mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <Field
              label="Nome do produto"
              id="productName"
              placeholder="Ex: Mouse Gamer XPTO"
              value={form.name}
              onChange={handleChange("name")}
            />
            <Field
              label="Marca"
              id="productBrand"
              placeholder="Ex: Logitech"
              value={form.brand}
              onChange={handleChange("brand")}
            />

            <div className="d-flex gap-3">
              <div className="flex-fill">
                <Field
                  label="Preço (R$)"
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.price}
                  onChange={handleChange("price")}
                />
              </div>
              <div className="flex-fill">
                <Field
                  label="Estoque"
                  id="productStock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange("stock")}
                />
              </div>
            </div>

            <div className="az-field-group">
              <label className="az-field-label" htmlFor="productImage">
                <span className="node" />
                Imagem do produto
              </label>
              <input
                id="productImage"
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

            {previewUrl && (
              <div className="az-image-preview-wrap">
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="az-image-preview"
                />
              </div>
            )}

            <Field
              label="Descrição"
              id="productDescription"
              type="textarea"
              rows={4}
              placeholder="Detalhes sobre o produto"
              value={form.description}
              onChange={handleChange("description")}
            />

            <button type="submit" className="btn az-btn w-100 mt-2" disabled={saving}>
              {saving
                ? "Salvando..."
                : isEdit
                ? "Salvar alterações"
                : "Adicionar produto"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
