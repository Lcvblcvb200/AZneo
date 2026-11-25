
import { useEffect, useRef, useState } from "react";
import "./checkout.css";
import {
  getCart,
  getAddresses,
  getProfile,
  createOrder,
  resolveImageUrl,
} from "./api.js";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);

const formatCPF = (cpf) => {
  if (!cpf) return "—";

  return String(cpf)
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatCNPJ = (cnpj) => {
  if (!cnpj) return "—";

  return String(cnpj)
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export default function Checkout({
  selectedAddress,
  onOpenAddresses,
  onBack,
  onRequireAuth,
}) {
  const [cart, setCart] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const submitting = useRef(false);

  // Carrega carrinho, endereços e perfil.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [cartData, addressData, profileData] = await Promise.all([
          getCart(),
          getAddresses(),
          getProfile(),
        ]);

        if (cancelled) return;

        setCart(cartData);
        setAddresses(Array.isArray(addressData) ? addressData : []);
        setProfile(profileData);
      } catch (err) {
        if (cancelled) return;

        if (err.status === 401) {
          onRequireAuth?.();
          return;
        }

        setError(err.message || "Não foi possível carregar o checkout.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };

    // Executar apenas na montagem da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAddress =
    selectedAddress || (addresses.length === 1 ? addresses[0] : null);

  const cartItems = cart?.items ?? [];

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.product?.price ?? item.unit_price ?? 0) *
        item.quantity,
    0
  );

  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const shipping =
    subtotal >= 200 ? 0 : subtotal >= 100 ? 10 : 20;

  const estimatedTotal = subtotal + shipping;

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current || order) return;

    if (!activeAddress) {
      setError("Selecione um endereço de entrega.");
      return;
    }

    if (!paymentMethod) {
      setError("Selecione uma forma de pagamento.");
      return;
    }

    if (!accepted) {
      setError("Aceite os termos para continuar.");
      return;
    }

    submitting.current = true;
    setProcessing(true);
    setError("");

    try {
      const created = await createOrder(
        activeAddress.id_address,
        coupon.trim() || null
      );

      setOrder(created);
    } catch (err) {
      if (err.status === 401) {
        onRequireAuth?.();
      } else {
        setError(err.message || "Não foi possível registrar o pedido.");
      }
    } finally {
      submitting.current = false;
      setProcessing(false);
    }
  }

  // Tela de carregamento.
  if (loading) {
    return (
      <main className="az-checkout az-checkout-loading">
        <section className="az-loading-content">
          <div className="az-loading-logo">
            AZ<span>NEO</span>
          </div>

          <div className="az-loading-spinner">
            <div className="az-loading-spinner-inner"></div>
          </div>

          <h1>Preparando seu checkout</h1>

          <p>
            Estamos organizando as informações do seu pedido.
            Só mais um instante...
          </p>

          <div className="az-loading-progress">
            <span></span>
          </div>

          <div className="az-loading-status">
            <span className="az-loading-dot"></span>
            CARREGANDO INFORMAÇÕES
          </div>

          <div className="az-loading-security">
            <span>✓</span>
            Ambiente seguro AZNEO
          </div>
        </section>
      </main>
    );
  }

  // Tela de confirmação do pedido.
  if (order) {
    return (
      <main className="az-checkout">
        <section className="az-checkout-success">
          <div className="az-checkout-success-icon">✓</div>

          <h1>Pedido criado</h1>

          <p>
            Seu pedido foi registrado e está aguardando pagamento.
          </p>

          <div className="az-checkout-success-line">
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>

          <div className="az-checkout-success-line">
            <span>Subtotal</span>
            <strong>{formatMoney(order.subtotal)}</strong>
          </div>

          <div className="az-checkout-success-line">
            <span>Frete</span>
            <strong>{formatMoney(order.shipping_cost)}</strong>
          </div>

          <div className="az-checkout-success-line">
            <span>Desconto</span>
            <strong>− {formatMoney(order.discount_amount)}</strong>
          </div>

          <div className="az-checkout-success-line az-checkout-success-total">
            <span>Total</span>
            <strong>{formatMoney(order.total_price)}</strong>
          </div>

          <p className="az-checkout-muted">
            Forma de pagamento selecionada:{" "}
            <strong>
              {{
                pix: "Pix",
                boleto: "Boleto bancário",
                credit: "Cartão de crédito",
                debit: "Cartão de débito",
              }[paymentMethod]}
            </strong>
            . A confirmação do pagamento será disponibilizada após
            a integração com o sistema de pagamentos.
          </p>

          <button
            className="az-checkout-primary"
            type="button"
            onClick={onBack}
          >
            Voltar ao carrinho
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="az-checkout">
      <div className="az-checkout-heading">
        <button
          type="button"
          className="az-checkout-back"
          onClick={onBack}
        >
          ← Voltar ao carrinho
        </button>

        <h1>FINALIZAR PEDIDO</h1>

        <p>Revise as informações antes de criar o pedido.</p>
      </div>

      {error && (
        <div className="az-checkout-error" role="alert">
          {error}
        </div>
      )}

      {!cart && error ? null : (
        <form className="az-checkout-grid" onSubmit={handleSubmit}>
          <div className="az-checkout-sections">
            {/* SEÇÃO 01 - CONTATO */}
            <section className="az-checkout-panel">
              <h2>
                <span className="az-checkout-num">01</span>
                {profile?.role === "company"
                  ? "DADOS DA EMPRESA"
                  : "CONTATO"}
              </h2>

              <div className="az-checkout-contact">
                {profile?.role === "company" ? (
                  <>
                    <div>
                      <span>Nome fantasia</span>
                      <strong>
                        {profile?.company?.trade_name || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Razão social</span>
                      <strong>
                        {profile?.company?.corporate_name || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>CNPJ</span>
                      <strong>
                        {formatCNPJ(profile?.company?.cnpj)}
                      </strong>
                    </div>

                    <div>
                      <span>Inscrição Estadual</span>
                      <strong>
                        {profile?.company?.ie || "Não informada"}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{profile?.email || "—"}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span>Nome</span>
                      <strong>{profile?.name || "—"}</strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>{profile?.email || "—"}</strong>
                    </div>

                    <div>
                      <span>CPF</span>
                      <strong>{formatCPF(profile?.cpf)}</strong>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* SEÇÃO 02 - ENTREGA */}
            <section className="az-checkout-panel">
              <h2>
                <span className="az-checkout-num">02</span>
                ENTREGA
              </h2>

              <div className="az-checkout-delivery">
                {activeAddress ? (
                  <div className="az-checkout-address-value">
                    <strong>
                      {activeAddress.logradouro},{" "}
                      {activeAddress.number}
                    </strong>

                    <span>
                      {activeAddress.neighborhood} —{" "}
                      {activeAddress.city}/{activeAddress.state}
                    </span>

                    <span>
                      CEP {activeAddress.cep}
                      {activeAddress.complement
                        ? ` • ${activeAddress.complement}`
                        : ""}
                    </span>
                  </div>
                ) : (
                  <div className="az-checkout-no-address">
                    Nenhum endereço selecionado
                  </div>
                )}

                <button
                  type="button"
                  className="az-checkout-outline"
                  onClick={onOpenAddresses}
                >
                  {activeAddress
                    ? "Alterar endereço"
                    : "+ Adicionar endereço"}
                </button>

                {addresses.length === 0 && (
                  <small>
                    Você ainda não possui endereços cadastrados.
                  </small>
                )}
              </div>

              <h3 className="az-checkout-subhead">
                Método de envio
              </h3>

              <div
                className={`az-checkout-shipping ${
                  !activeAddress ? "is-disabled" : ""
                }`}
              >
                {activeAddress ? (
                  <>
                    <span>Entrega padrão (simulada)</span>
                    <strong>
                      {shipping === 0
                        ? "Grátis"
                        : formatMoney(shipping)}
                    </strong>
                  </>
                ) : (
                  "Selecione um endereço primeiro"
                )}
              </div>
            </section>

            {/* SEÇÃO 03 - PAGAMENTO */}
            <section className="az-checkout-panel">
              <h2>
                <span className="az-checkout-num">03</span>
                PAGAMENTO
              </h2>

              <div className="az-checkout-payment">
                <p className="az-checkout-payment-description">
                  Escolha como deseja pagar seu pedido.
                </p>

                <div className="az-checkout-payment-options">
                  <button
                    type="button"
                    className={`az-checkout-method ${
                      paymentMethod === "pix" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("pix")}
                    aria-pressed={paymentMethod === "pix"}
                  >
                    <span className="az-payment-icon">◇</span>

                    <span className="az-payment-info">
                      <strong>Pix</strong>
                      <small>Pagamento instantâneo</small>
                    </span>

                    <span className="az-payment-radio"></span>
                  </button>

                  <button
                    type="button"
                    className={`az-checkout-method ${
                      paymentMethod === "boleto" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("boleto")}
                    aria-pressed={paymentMethod === "boleto"}
                  >
                    <span className="az-payment-icon">▤</span>

                    <span className="az-payment-info">
                      <strong>Boleto bancário</strong>
                      <small>Pagamento via boleto</small>
                    </span>

                    <span className="az-payment-radio"></span>
                  </button>

                  <button
                    type="button"
                    className={`az-checkout-method ${
                      paymentMethod === "credit" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("credit")}
                    aria-pressed={paymentMethod === "credit"}
                  >
                    <span className="az-payment-icon">▣</span>

                    <span className="az-payment-info">
                      <strong>Cartão de crédito</strong>
                      <small>
                        Parcelamento conforme condições disponíveis
                      </small>
                    </span>

                    <span className="az-payment-radio"></span>
                  </button>

                  <button
                    type="button"
                    className={`az-checkout-method ${
                      paymentMethod === "debit" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("debit")}
                    aria-pressed={paymentMethod === "debit"}
                  >
                    <span className="az-payment-icon">▣</span>

                    <span className="az-payment-info">
                      <strong>Cartão de débito</strong>
                      <small>Pagamento à vista</small>
                    </span>

                    <span className="az-payment-radio"></span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* RESUMO DO PEDIDO */}
          <aside className="az-checkout-summary">
            <h2>RESUMO DO PEDIDO</h2>

            {cartItems.length === 0 ? (
              <p className="az-checkout-muted">
                Seu carrinho está vazio.
              </p>
            ) : (
              <div className="az-checkout-products">
                {cartItems.map((item) => (
                  <div
                    className="az-checkout-product"
                    key={item.id_item}
                  >
                    {item.product?.image_url && (
                      <img
                        src={resolveImageUrl(item.product.image_url)}
                        alt=""
                      />
                    )}

                    <div>
                      <strong>
                        {item.product?.product_name || "Produto"}
                      </strong>

                      <small>
                        Quantidade: {item.quantity}
                      </small>

                      <b>
                        {formatMoney(
                          Number(
                            item.product?.price ?? item.unit_price
                          ) * item.quantity
                        )}
                      </b>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="az-checkout-price-row">
              <span>Produtos ({itemCount})</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>

            <div className="az-checkout-price-row">
              <span>Frete estimado</span>
              <strong>
                {shipping === 0 ? "Grátis" : formatMoney(shipping)}
              </strong>
            </div>

            <label
              className="az-checkout-coupon-label"
              htmlFor="az-coupon"
            >
              Cupom de desconto
            </label>

            <input
              id="az-coupon"
              className="az-checkout-coupon"
              value={coupon}
              onChange={(event) =>
                setCoupon(event.target.value.toUpperCase())
              }
              placeholder="Ex.: AZNEO10"
              maxLength={50}
            />

            {coupon.trim() && (
              <small className="az-checkout-muted">
                O cupom será validado pelo backend ao criar o pedido.
              </small>
            )}

            <div className="az-checkout-total">
              <span>Total antes do desconto</span>
              <strong>{formatMoney(estimatedTotal)}</strong>
            </div>

            <label className="az-checkout-terms">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) =>
                  setAccepted(event.target.checked)
                }
              />

              <span>
                Li e concordo com os termos e condições de compra.
              </span>
            </label>

            <button
              className="az-checkout-primary"
              type="submit"
              disabled={
                processing ||
                !activeAddress ||
                !accepted ||
                !paymentMethod ||
                cartItems.length === 0 ||
                Boolean(error && !cart)
              }
            >
              {processing ? "PROCESSANDO..." : "FINALIZAR PEDIDO"}
            </button>
          </aside>
        </form>
      )}
    </main>
  );
}
