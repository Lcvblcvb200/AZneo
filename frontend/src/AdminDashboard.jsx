
import { useEffect, useState } from "react";
import { getAdminDashboard } from "./api.js";
import "./admin-dashboard.css";

const money = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const date = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("pt-BR");
};

const periods = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "12m", label: "12 meses" },
  { value: "all", label: "Todo o período" },
];

export default function AdminDashboard({ onBack }) {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminDashboard(period);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Não foi possível carregar o dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const exportCSV = () => {
    if (!data?.report_orders?.length) {
      window.alert("Não existem pedidos para exportar neste período.");
      return;
    }

    const columns = [
      ["Pedido", "id_order"],
      ["Cliente", "customer"],
      ["E-mail", "email"],
      ["Data", "date"],
      ["Subtotal", "subtotal"],
      ["Frete", "shipping"],
      ["Desconto", "discount"],
      ["Total", "total"],
      ["Itens", "items"],
      ["Status", "status"],
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const lines = [
      columns.map(([label]) => escapeCSV(label)).join(";"),
      ...data.report_orders.map((order) =>
        columns
          .map(([, key]) => escapeCSV(order[key]))
          .join(";")
      ),
    ];

    const csv = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `azneo-relatorio-${period}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const summary = data?.summary;

  const maxRevenue = Math.max(
    ...(data?.sales_chart || []).map((item) => item.revenue),
    1
  );

  if (loading && !data) {
    return (
      <main className="az-dashboard">
        <div className="az-dashboard-loading">
          Carregando estatísticas...
        </div>
      </main>
    );
  }

  return (
    <main className="az-dashboard">
      <header className="az-dashboard-header">
        <div>
          <button
            type="button"
            className="az-dashboard-back"
            onClick={onBack}
          >
            ← Voltar ao catálogo
          </button>

          <span className="az-dashboard-kicker">
            AZNEO / ADMINISTRAÇÃO
          </span>

          <h1>Estatísticas e relatórios</h1>
        </div>

        <div className="az-dashboard-actions">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Período do relatório"
          >
            {periods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!data?.report_orders?.length}
          >
            ↓ Exportar CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="az-dashboard-error">
          {error}
        </div>
      )}

      {loading && data && (
        <div className="az-dashboard-refreshing">
          Atualizando dados...
        </div>
      )}

      {summary && (
        <>
          <section className="az-dashboard-section">
            <div className="az-dashboard-section-heading">
              <span>VISÃO GERAL</span>
              <small>Indicadores do período selecionado</small>
            </div>

            <div className="az-dashboard-stats">
              <StatCard
                label="Valor dos pedidos"
                value={money(summary.total_revenue)}
                detail="Pedidos não cancelados"
                icon="R$"
              />

              <StatCard
                label="Total de pedidos"
                value={summary.total_orders}
                detail="Pedidos registrados"
                icon="#"
              />

              <StatCard
                label="Ticket médio"
                value={money(summary.average_ticket)}
                detail="Valor por pedido"
                icon="↗"
              />

              <StatCard
                label="Clientes"
                value={summary.total_customers}
                detail="Contas de clientes"
                icon="◎"
              />

              <StatCard
                label="Produtos ativos"
                value={summary.total_products}
                detail="Produtos disponíveis"
                icon="▦"
              />

              <StatCard
                label="Estoque baixo"
                value={summary.low_stock_products}
                detail="Até 5 unidades"
                icon="!"
                warning={summary.low_stock_products > 0}
              />
            </div>
          </section>

          <section className="az-dashboard-grid">
            <div className="az-dashboard-panel az-dashboard-sales">
              <div className="az-dashboard-panel-heading">
                <div>
                  <span>DESEMPENHO</span>
                  <h2>Evolução das vendas</h2>
                </div>
                <small>Valor dos pedidos por mês</small>
              </div>

              {data.sales_chart.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="az-sales-chart">
                  {data.sales_chart.map((item) => (
                    <div
                      className="az-sales-column"
                      key={item.month}
                      title={`${item.month}: ${money(item.revenue)} / ${item.orders} pedidos`}
                    >
                      <strong>{money(item.revenue)}</strong>

                      <div className="az-sales-bar-area">
                        <div
                          className="az-sales-bar"
                          style={{
                            height: `${Math.max(
                              (item.revenue / maxRevenue) * 100,
                              3
                            )}%`,
                          }}
                        />
                      </div>

                      <span>
                        {new Date(
                          `${item.month}-02T12:00:00`
                        ).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="az-dashboard-panel">
              <div className="az-dashboard-panel-heading">
                <div>
                  <span>PEDIDOS</span>
                  <h2>Status dos pedidos</h2>
                </div>
              </div>

              <div className="az-status-summary">
                <StatusRow
                  label="Pendentes"
                  value={summary.pending_orders}
                />

                <StatusRow
                  label="Concluídos"
                  value={summary.completed_orders}
                />

                <StatusRow
                  label="Cancelados"
                  value={summary.cancelled_orders}
                />
              </div>

              <div className="az-status-divider" />

              {data.order_status.map((item) => (
                <StatusRow
                  key={item.status}
                  label={item.status}
                  value={item.quantity}
                />
              ))}
            </div>
          </section>

          <section className="az-dashboard-grid">
            <div className="az-dashboard-panel">
              <div className="az-dashboard-panel-heading">
                <div>
                  <span>PRODUTOS</span>
                  <h2>Mais vendidos</h2>
                </div>
              </div>

              {data.best_sellers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="az-dashboard-table-wrap">
                  <table className="az-dashboard-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Unidades</th>
                        <th>Valor vendido</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.best_sellers.map((item, index) => (
                        <tr key={`${item.product_name}-${index}`}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{money(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="az-dashboard-panel az-stock-panel">
              <div className="az-dashboard-panel-heading">
                <div>
                  <span>INVENTÁRIO</span>
                  <h2>Atenção ao estoque</h2>
                </div>
              </div>

              <div className="az-stock-number">
                <strong>{summary.low_stock_products}</strong>
                <span>Produtos com estoque baixo</span>
              </div>

              <div className="az-stock-number danger">
                <strong>{summary.out_of_stock_products}</strong>
                <span>Produtos esgotados</span>
              </div>

              <p>
                Estoque baixo considera produtos ativos com até 5 unidades.
              </p>
            </div>
          </section>

          <section className="az-dashboard-panel az-dashboard-recent">
            <div className="az-dashboard-panel-heading">
              <div>
                <span>MOVIMENTAÇÃO</span>
                <h2>Pedidos recentes</h2>
              </div>
              <small>Últimos 10 pedidos</small>
            </div>

            {data.recent_orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="az-dashboard-table-wrap">
                <table className="az-dashboard-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Itens</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recent_orders.map((order) => (
                      <tr key={order.id_order}>
                        <td>#{order.id_order}</td>
                        <td>
                          <strong>{order.contact_name}</strong>
                          <small>{order.contact_email}</small>
                        </td>
                        <td>{date(order.created_at)}</td>
                        <td>{order.total_items}</td>
                        <td>{money(order.total_price)}</td>
                        <td>
                          <span className="az-order-status">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({ label, value, detail, icon, warning }) {
  return (
    <article className={`az-stat-card ${warning ? "warning" : ""}`}>
      <div className="az-stat-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>

      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="az-status-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="az-dashboard-empty">
      Nenhum dado encontrado para este período.
    </div>
  );
}
