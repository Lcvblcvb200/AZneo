import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./catalog-theme.css";

import logo from "./assets/logo-azneo-full.png";

import {
  createProduct,
  updateProduct,
  resolveImageUrl,
} from "./api.js";


// =========================================================
// CATEGORIAS FIXAS
// =========================================================

const PRODUCT_CATEGORIES = [
  "Teclados",
  "Mouses",
  "Hardwares",
  "Monitores",
  "Cadeiras",
  "Mesas",
];


// =========================================================
// CAMPO PADRÃO
// =========================================================

function Field({
  label,
  id,
  type = "text",
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const Tag =
    type === "textarea"
      ? "textarea"
      : "input";

  return (
    <div
      className={`az-field-group ${
        focused ? "focused" : ""
      }`}
    >
      <label
        className="az-field-label"
        htmlFor={id}
      >
        <span className="node" />
        {label}
      </label>

      <Tag
        id={id}
        type={
          type === "textarea"
            ? undefined
            : type
        }
        className="form-control"
        onFocus={() => setFocused(true)}
        onBlur={(e) =>
          setFocused(
            Boolean(e.target.value)
          )
        }
        {...props}
      />
    </div>
  );
}


// =========================================================
// PRODUCT FORM
// =========================================================

export default function ProductFormPage({
  mode = "create",
  product,
  onDone,
  onCancel,
}) {
  const isEdit = mode === "edit";


  // =======================================================
  // FORMULÁRIO
  // =======================================================

  const [form, setForm] = useState({
    name:
      product?.product_name || "",

    description:
      product?.description || "",

    brand:
      product?.brand || "",

    category:
      product?.category || "",

    price:
      product?.price ?? "",

    stock:
      product?.stock ?? "",

    barcode:
      product?.barcode || "",
  });


  // =======================================================
  // IMAGEM
  // =======================================================

  const [imageFile, setImageFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(
      isEdit
        ? resolveImageUrl(
            product?.image_url
          )
        : null
    );


  // =======================================================
  // ESTADOS
  // =======================================================

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  // =======================================================
  // LIMPEZA DA PREVIEW
  // =======================================================

  useEffect(() => {
    return () => {
      if (
        imageFile &&
        previewUrl
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [
    imageFile,
    previewUrl,
  ]);


  // =======================================================
  // ALTERAR CAMPOS
  // =======================================================

  const handleChange =
    (field) => (e) => {
      setForm({
        ...form,
        [field]: e.target.value,
      });
    };


  // =======================================================
  // CÓDIGO DE BARRAS
  // =======================================================

  const handleBarcodeChange = (e) => {
    const onlyNumbers =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 13);

    setForm({
      ...form,
      barcode: onlyNumbers,
    });
  };


  // =======================================================
  // IMAGEM
  // =======================================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Selecione um arquivo de imagem válido."
      );

      return;
    }

    setError("");

    if (
      imageFile &&
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setImageFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );
  };


  // =======================================================
  // ENVIAR FORMULÁRIO
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();


    // -----------------------------------------------------
    // CAMPOS OBRIGATÓRIOS
    // -----------------------------------------------------

    if (
      !form.name.trim() ||
      !form.brand.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.barcode.trim()
    ) {
      setError(
        "Preencha nome, marca, categoria, código de barras e descrição."
      );

      return;
    }


    // -----------------------------------------------------
    // CÓDIGO DE BARRAS
    // -----------------------------------------------------

    if (
      !/^\d{13}$/.test(
        form.barcode.trim()
      )
    ) {
      setError(
        "O código de barras deve conter exatamente 13 números."
      );

      return;
    }


    // -----------------------------------------------------
    // PREÇO
    // -----------------------------------------------------

    if (
      Number(form.price) <= 0
    ) {
      setError(
        "Informe um preço válido."
      );

      return;
    }


    // -----------------------------------------------------
    // ESTOQUE
    // -----------------------------------------------------

    if (
      Number(form.stock) < 0 ||
      !Number.isInteger(
        Number(form.stock)
      )
    ) {
      setError(
        "Informe uma quantidade de estoque válida."
      );

      return;
    }


    // -----------------------------------------------------
    // IMAGEM OBRIGATÓRIA AO CRIAR
    // -----------------------------------------------------

    if (
      !isEdit &&
      !imageFile
    ) {
      setError(
        "Selecione uma imagem para o produto."
      );

      return;
    }


    setError("");
    setSaving(true);


    try {

      // ===================================================
      // FORMDATA
      // ===================================================

      const formData =
        new FormData();


      formData.append(
        "name",
        form.name.trim()
      );


      formData.append(
        "description",
        form.description.trim()
      );


      formData.append(
        "brand",
        form.brand.trim()
      );


      // Categoria selecionada
      formData.append(
        "category",
        form.category
      );


      formData.append(
        "price",
        String(
          Number(form.price)
        )
      );


      formData.append(
        "stock",
        String(
          Number(form.stock)
        )
      );


      formData.append(
        "barcode",
        form.barcode.trim()
      );


      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }


      // ===================================================
      // CREATE / UPDATE
      // ===================================================

      const result =
        isEdit
          ? await updateProduct(
              product.id_product,
              formData
            )
          : await createProduct(
              formData
            );


      if (onDone) {
        onDone(result);
      }


    } catch (err) {

      if (
        err.status === 409
      ) {
        setError(
          "Já existe um produto com esse nome ou código de barras."
        );

      } else {

        setError(
          err.message ||
            "Erro ao salvar produto."
        );
      }

    } finally {

      setSaving(false);
    }
  };


  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div className="az-catalog">

      {/* HEADER */}

      <header className="az-topbar">

        <img
          src={logo}
          alt="AZNEO"
          className="az-topbar-logo"
        />

        <button
          type="button"
          className="az-back-link"
          onClick={onCancel}
        >
          ← Voltar
        </button>

      </header>


      {/* CONTEÚDO */}

      <main className="az-detail-main">

        <div className="az-form-card">


          {/* TÍTULO */}

          <div className="az-form-title">

            {isEdit
              ? "Editar produto"
              : "Adicionar produto"}

          </div>


          <div className="az-form-caption">

            {isEdit
              ? "Atualize as informações do produto."
              : "Preencha os dados do produto que você quer anunciar."}

          </div>


          {/* ERRO */}

          {error && (
            <div className="az-error-box mono mb-3">
              {error}
            </div>
          )}


          {/* FORMULÁRIO */}

          <form onSubmit={handleSubmit}>


            {/* NOME */}

            <Field
              label="Nome do produto"
              id="productName"
              placeholder="Ex: Mouse Gamer XPTO"
              value={form.name}
              onChange={
                handleChange("name")
              }
            />


            {/* MARCA */}

            <Field
              label="Marca"
              id="productBrand"
              placeholder="Ex: Logitech"
              value={form.brand}
              onChange={
                handleChange("brand")
              }
            />


            {/* CATEGORIA */}

            <div className="az-field-group">

              <label
                className="az-field-label"
                htmlFor="productCategory"
              >
                <span className="node" />
                Categoria
              </label>

              <select
                id="productCategory"
                className="form-control"
                value={form.category}
                onChange={
                  handleChange("category")
                }
                required
              >

                <option value="">
                  Selecione uma categoria
                </option>

                {PRODUCT_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* CÓDIGO DE BARRAS */}

            <Field
              label="Código de barras"
              id="productBarcode"
              type="text"
              inputMode="numeric"
              maxLength={13}
              placeholder="Ex: 7891234567890"
              value={form.barcode}
              onChange={
                handleBarcodeChange
              }
            />


            {/* PREÇO + ESTOQUE */}

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
                  onChange={
                    handleChange("price")
                  }
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
                  onChange={
                    handleChange("stock")
                  }
                />

              </div>

            </div>


            {/* IMAGEM */}

            <div className="az-field-group">

              <label
                className="az-field-label"
                htmlFor="productImage"
              >
                <span className="node" />
                Imagem do produto
              </label>


              <div className="az-file-upload">

                <input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  className="az-file-input"
                  onChange={
                    handleImageChange
                  }
                />


                <label
                  htmlFor="productImage"
                  className="az-file-button"
                >

                  <span className="az-file-icon">
                    +
                  </span>

                  Selecionar imagem

                </label>


                <span className="az-file-name">

                  {imageFile
                    ? imageFile.name
                    : isEdit
                    ? "Selecionar nova imagem"
                    : "Nenhuma imagem selecionada"}

                </span>

              </div>

            </div>


            {/* PREVIEW */}

            {previewUrl && (

              <div className="az-image-preview-wrap">

                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="az-image-preview"
                />

              </div>

            )}


            {/* DESCRIÇÃO */}

            <Field
              label="Descrição"
              id="productDescription"
              type="textarea"
              rows={4}
              placeholder="Detalhes sobre o produto"
              value={
                form.description
              }
              onChange={
                handleChange(
                  "description"
                )
              }
            />


            {/* BOTÃO */}

            <button
              type="submit"
              className="btn az-btn w-100 mt-2"
              disabled={saving}
            >

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