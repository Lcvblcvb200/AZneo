
import { useEffect, useState } from "react";
import { getAddresses, createAddress } from "./api.js";
import "./address-modal.css";

const emptyAddress = {
  cep: "",
  logradouro: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export default function AddressModal({
  onClose,
  onSelect,
  selectedAddress,
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(
    selectedAddress ? String(selectedAddress.id_address) : ""
  );

  const [mode, setMode] = useState("select");
  const [form, setForm] = useState({ ...emptyAddress });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAddresses() {
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleConfirm() {
    const address = addresses.find(
      (item) => String(item.id_address) === selectedId
    );

    if (!address) return;

    onSelect(address);
    onClose();
  }

  async function handleCreateAddress(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const address = await createAddress({
        cep: form.cep.replace(/\D/g, ""),
        logradouro: form.logradouro.trim(),
        number: form.number.trim(),
        complement: form.complement.trim() || null,
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
      });

      setAddresses((previous) => [address, ...previous]);
      onSelect(address);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="az-address-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        className="az-address-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="az-address-title"
      >
        <div className="az-address-header">
          <h2 id="az-address-title">
            {mode === "select"
              ? "Escolha um endereço"
              : "Adicionar novo endereço"}
          </h2>

          <button
            type="button"
            className="az-address-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="az-address-error" role="alert">
            {error}
          </div>
        )}

        {mode === "select" ? (
          <>
            <div className="az-address-content">
              {loading ? (
                <p className="az-address-empty">
                  Carregando endereços...
                </p>
              ) : addresses.length === 0 ? (
                <p className="az-address-empty">
                  Nenhum endereço cadastrado.
                </p>
              ) : (
                <div className="az-address-list">
                  {addresses.map((address) => (
                    <label
                      key={address.id_address}
                      className={`az-address-option ${
                        selectedId === String(address.id_address)
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={
                          selectedId === String(address.id_address)
                        }
                        onChange={() =>
                          setSelectedId(String(address.id_address))
                        }
                      />

                      <div className="az-address-info">
                        <strong>
                          {address.logradouro}, {address.number}
                        </strong>

                        <span>
                          {address.neighborhood} — {address.city}/
                          {address.state}
                        </span>

                        <small>CEP: {address.cep}</small>

                        {address.complement && (
                          <small>{address.complement}</small>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="az-address-footer">
              <button
                type="button"
                className="az-address-secondary"
                onClick={() => {
                  setError("");
                  setMode("create");
                }}
              >
                + Adicionar endereço
              </button>

              <button
                type="button"
                className="az-address-primary"
                onClick={handleConfirm}
                disabled={!selectedId || loading}
              >
                Confirmar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateAddress}>
            <div className="az-address-content">
              <div className="az-address-form">
                {[
                  ["cep", "CEP", "00000-000"],
                  ["logradouro", "Rua / Avenida", "Nome da rua"],
                  ["number", "Número", "123"],
                  ["complement", "Complemento", "Opcional"],
                  ["neighborhood", "Bairro", "Seu bairro"],
                  ["city", "Cidade", "Sua cidade"],
                  ["state", "Estado (UF)", "RJ"],
                ].map(([field, label, placeholder]) => (
                  <div
                    className={`az-address-field az-address-field-${field}`}
                    key={field}
                  >
                    <label htmlFor={`address-${field}`}>
                      {label}
                    </label>

                    <input
                      id={`address-${field}`}
                      type="text"
                      placeholder={placeholder}
                      value={form[field]}
                      required={field !== "complement"}
                      maxLength={
                        field === "state"
                          ? 2
                          : field === "cep"
                            ? 9
                            : undefined
                      }
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="az-address-footer">
              <button
                type="button"
                className="az-address-secondary"
                disabled={saving}
                onClick={() => {
                  setError("");
                  setMode("select");
                }}
              >
                Voltar
              </button>

              <button
                type="submit"
                className="az-address-primary"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar endereço"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
