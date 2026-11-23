
import { useEffect, useMemo, useState } from "react";
import { getAccessToken } from "./api.js";
import "./code-dashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const initialForm = {
  code: "",
  discount: "",
  discount_type: "percentage",
  expires_at: "",
  usage_limit: "",
  minimum_order: "0.00",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Sem validade";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleString("pt-BR");
}

function isExpired(code) {
  if (!code.expires_at) return false;

  return new Date(code.expires_at).getTime() < Date.now();
}

function getDiscountLabel(code) {
  if (code.discount_type === "percentage") {
    return `${Number(code.discount)}%`;
  }

  return formatCurrency(code.discount);
}

async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Não foi possível concluir a operação.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item.msg)
        .join(" | ");
    }

    if (response.status === 401) {
      message = "Sessão expirada ou usuário não autenticado.";
    }

    if (response.status === 403) {
      message = "Você não tem permissão para acessar esta área.";
    }

    throw new Error(message);
  }

  return data;
}

export default function CodeDashboard() {
  const [codes, setCodes] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Buscar cupons
  async function loadCodes() {
    try {
      setError("");

      const data = await apiRequest("/codes/view");

      setCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar os cupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCodes();
  }, []);

  // Atualizar formulário
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Métricas
  const metrics = useMemo(() => {
    const active = codes.filter((code) => code.is_active);
    const inactive = codes.filter((code) => !code.is_active);

    const totalUsed = codes.reduce(
      (total, code) => total + Number(code.used_count || 0),
      0
    );

    return {
      total: codes.length,
      active: active.length,
      inactive: inactive.length,
      used: totalUsed,
    };
  }, [codes]);

  // Pesquisa e filtros
  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const matchesSearch = code.code
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter = code.is_active;
      } else if (filter === "inactive") {
        matchesFilter = !code.is_active;
      } else if (filter === "expired") {
        matchesFilter = isExpired(code);
      }

      return matchesSearch && matchesFilter;
    });
  }, [codes, search, filter]);

  // Criar cupom
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const activeCodes = codes.filter(
      (code) => code.is_active
    ).length;

    if (activeCodes >= 5) {
      setError("Você já possui o limite de 5 cupons ativos.");
      return;
    }

    if (!form.code.trim()) {
      setError("Informe o código do cupom.");
      return;
    }

    if (!form.discount || Number(form.discount) <= 0) {
      setError("Informe um valor de desconto válido.");
      return;
    }

    if (
      form.discount_type === "percentage" &&
      Number(form.discount) > 100
    ) {
      setError("O desconto percentual não pode ultrapassar 100%.");
      return;
    }

    if (
      form.usage_limit.trim() !== "" &&
      Number(form.usage_limit) <= 0
    ) {
      setError("O limite de utilizações deve ser maior que zero.");
      return;
    }

    if (Number(form.minimum_order) < 0) {
      setError("O valor mínimo do pedido não pode ser negativo.");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount: Number(form.discount),
      discount_type: form.discount_type,
      expires_at: form.expires_at
        ? new Date(form.expires_at).toISOString()
        : null,
      usage_limit:
        form.usage_limit.trim() === ""
          ? null
          : Number(form.usage_limit),
      minimum_order: Number(form.minimum_order || 0),
      is_active: true,
    };

    try {
      setSaving(true);

      await apiRequest("/codes/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setForm(initialForm);
      setSuccess("Cupom criado com sucesso!");

      await loadCodes();
    } catch (err) {
      setError(err.message || "Não foi possível criar o cupom.");
    } finally {
      setSaving(false);
    }
  }

  // Desativar cupom
  async function handleDeactivate(code) {
    const confirmed = window.confirm(
      `Deseja realmente desativar o cupom "${code.code}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      setDeactivating(code.id_code);

      await apiRequest(`/codes/delete/${code.id_code}`, {
        method: "DELETE",
      });

      setSuccess(`Cupom ${code.code} desativado com sucesso!`);

      await loadCodes();
    } catch (err) {
      setError(err.message || "Não foi possível desativar o cupom.");
    } finally {
      setDeactivating(null);
    }
  }

  // Limpar mensagens
  function clearMessages() {
    setError("");
    setSuccess("");
  }

  return (
    <main className="code-dashboard">
      <header className="code-dashboard-header">
        <div>
          <span className="code-dashboard-eyebrow">
            AZNEO ADMINISTRAÇÃO
          </span>

          <h1>Cupons de desconto</h1>

          <p>
            Gerencie os cupons promocionais da sua loja.
          </p>
        </div>

        <button
          type="button"
          className="code-refresh-button"
          onClick={loadCodes}
          disabled={loading}
        >
          ↻ Atualizar
        </button>
      </header>

      {/* Mensagens */}
      {error && (
        <div className="code-alert code-alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={clearMessages}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="code-alert code-alert-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={clearMessages}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}

      {/* Indicadores */}
      <section className="code-metrics">
        <article className="code-metric-card">
          <span className="code-metric-label">
            Total de cupons
          </span>

          <strong>{metrics.total}</strong>

          <small>Cupons cadastrados</small>
        </article>

        <article className="code-metric-card">
          <span className="code-metric-label">
            Cupons ativos
          </span>

          <strong>{metrics.active}/5</strong>

          <small>Limite de cupons ativos</small>
        </article>

        <article className="code-metric-card">
          <span className="code-metric-label">
            Cupons inativos
          </span>

          <strong>{metrics.inactive}</strong>

          <small>Cupons desativados</small>
        </article>

        <article className="code-metric-card">
          <span className="code-metric-label">
            Utilizações
          </span>

          <strong>{metrics.used}</strong>

          <small>Total de utilizações</small>
        </article>
      </section>

      {/* Formulário */}
      <section className="code-panel">
        <div className="code-panel-header">
          <div>
            <h2>Criar novo cupom</h2>

            <p>
              Configure os detalhes da nova promoção.
            </p>
          </div>

          <span className="code-limit-indicator">
            {metrics.active}/5 ativos
          </span>
        </div>

        {metrics.active >= 5 && (
          <div className="code-limit-warning">
            Você atingiu o limite de 5 cupons ativos.
            Desative um cupom para cadastrar outro.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="code-form-grid">
            <div className="code-form-group">
              <label htmlFor="code">
                Código do cupom
              </label>

              <input
                id="code"
                name="code"
                type="text"
                placeholder="EX: AZNEO10"
                value={form.code}
                onChange={handleChange}
                maxLength={50}
                required
                disabled={saving || metrics.active >= 5}
              />
            </div>

            <div className="code-form-group">
              <label htmlFor="discount_type">
                Tipo de desconto
              </label>

              <select
                id="discount_type"
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
                disabled={saving || metrics.active >= 5}
              >
                <option value="percentage">
                  Porcentagem (%)
                </option>

                <option value="fixed">
                  Valor fixo (R$)
                </option>
              </select>
            </div>

            <div className="code-form-group">
              <label htmlFor="discount">
                Valor do desconto
              </label>

              <input
                id="discount"
                name="discount"
                type="number"
                placeholder="Ex: 10"
                min="0.01"
                step="0.01"
                value={form.discount}
                onChange={handleChange}
                required
                disabled={saving || metrics.active >= 5}
              />
            </div>

            <div className="code-form-group">
              <label htmlFor="minimum_order">
                Pedido mínimo (R$)
              </label>

              <input
                id="minimum_order"
                name="minimum_order"
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={form.minimum_order}
                onChange={handleChange}
                disabled={saving || metrics.active >= 5}
              />
            </div>

            <div className="code-form-group">
              <label htmlFor="usage_limit">
                Limite de utilizações
              </label>

              <input
                id="usage_limit"
                name="usage_limit"
                type="number"
                placeholder="Ilimitado"
                min="1"
                step="1"
                value={form.usage_limit}
                onChange={handleChange}
                disabled={saving || metrics.active >= 5}
              />

              <small>
                Deixe vazio para não definir um limite.
              </small>
            </div>

            <div className="code-form-group">
              <label htmlFor="expires_at">
                Data de validade
              </label>

              <input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                value={form.expires_at}
                onChange={handleChange}
                disabled={saving || metrics.active >= 5}
              />

              <small>
                Deixe vazio para não definir uma validade.
              </small>
            </div>
          </div>

          <div className="code-form-footer">
            <button
              type="button"
              className="code-clear-button"
              onClick={() => {
                setForm(initialForm);
                clearMessages();
              }}
              disabled={saving}
            >
              Limpar campos
            </button>

            <button
              type="submit"
              className="code-submit-button"
              disabled={saving || metrics.active >= 5}
            >
              {saving ? "Criando..." : "+ Criar cupom"}
            </button>
          </div>
        </form>
      </section>

      {/* Lista de cupons */}
      <section className="code-panel">
        <div className="code-panel-header">
          <div>
            <h2>Cupons cadastrados</h2>

            <p>
              Consulte e gerencie os cupons da loja.
            </p>
          </div>

          <span className="code-total-label">
            {filteredCodes.length} resultado(s)
          </span>
        </div>

        {/* Pesquisa e filtros */}
        <div className="code-toolbar">
          <div className="code-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Pesquisar cupom..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="code-filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>

            <button
              type="button"
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Ativos
            </button>

            <button
              type="button"
              className={filter === "inactive" ? "active" : ""}
              onClick={() => setFilter("inactive")}
            >
              Inativos
            </button>

            <button
              type="button"
              className={filter === "expired" ? "active" : ""}
              onClick={() => setFilter("expired")}
            >
              Expirados
            </button>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="code-empty-state">
            <div className="code-loader" />
            <p>Carregando cupons...</p>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="code-empty-state">
            <span className="code-empty-icon">%</span>

            <h3>Nenhum cupom encontrado</h3>

            <p>
              Não existem cupons correspondentes à sua pesquisa.
            </p>
          </div>
        ) : (
          <div className="code-table-wrapper">
            <table className="code-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Desconto</th>
                  <th>Pedido mínimo</th>
                  <th>Utilizações</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredCodes.map((code) => {
                  const expired = isExpired(code);

                  return (
                    <tr key={code.id_code}>
                      <td>
                        <strong className="code-name">
                          {code.code}
                        </strong>
                      </td>

                      <td>
                        <span className="code-discount">
                          {getDiscountLabel(code)}
                        </span>
                      </td>

                      <td>
                        {formatCurrency(code.minimum_order)}
                      </td>

                      <td>
                        <span className="code-usage">
                          {code.used_count || 0}
                          {" / "}
                          {code.usage_limit ?? "∞"}
                        </span>
                      </td>

                      <td>
                        {formatDate(code.expires_at)}
                      </td>

                      <td>
                        {!code.is_active ? (
                          <span className="code-status inactive">
                            Inativo
                          </span>
                        ) : expired ? (
                          <span className="code-status expired">
                            Expirado
                          </span>
                        ) : (
                          <span className="code-status active">
                            Ativo
                          </span>
                        )}
                      </td>

                      <td>
                        {code.is_active ? (
                          <button
                            type="button"
                            className="code-deactivate-button"
                            onClick={() => handleDeactivate(code)}
                            disabled={
                              deactivating === code.id_code
                            }
                          >
                            {deactivating === code.id_code
                              ? "Desativando..."
                              : "Desativar"}
                          </button>
                        ) : (
                          <span className="code-no-action">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
