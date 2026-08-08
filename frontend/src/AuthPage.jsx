import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./auth-theme.css";
import logo from "./assets/logo-azneo-full.png";
import { signIn, signUp, saveTokens } from "./api.js"; 


export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); 
  const isSignIn = mode === "signin";

  return (
    <div className="az-shell">
      {}
      <aside className="az-side">
        <svg className="az-circuit-bg" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#2DD8F0" strokeWidth="1" fill="none" opacity="0.5">
            <path d="M0 120 H90 L120 150 V260" />
            <path d="M500 200 H430 L400 230 V400" />
            <path d="M0 520 H70 L100 550 V650" />
            <path d="M500 560 H410 L380 590 V700" />
          </g>
          <g fill="#2DD8F0">
            <circle cx="120" cy="260" r="4" />
            <circle cx="400" cy="400" r="4" />
            <circle cx="100" cy="650" r="4" />
            <circle cx="380" cy="700" r="4" />
          </g>
        </svg>

        <div className="az-side-content">
          <div className="az-logo-row az-logo-row-full">
            <img
              src={logo}
              alt="AZNEO — Portal de compras e vendas de eletrônicos"
              className="az-logo-full"
            />
            <div className="az-status-line mono">
              <span className="az-status-dot" />
              PORTAL ONLINE
            </div>
          </div>

          <h1 className="az-headline">
            Compre e venda
            <br />
            eletrônicos com <span className="accent">confiança</span>.
          </h1>
          <p className="az-sub">
            O AZNEO conecta quem quer vender periféricos e eletrônicos a quem
            procura o próximo upgrade — com segurança em cada etapa da
            negociação.
          </p>

          <ul className="az-trace-list">
            <li className="az-trace-item">
              <span className="az-trace-node" />
              <h6>Vendedores verificados</h6>
              <p>Perfis analisados antes de anunciar na plataforma.</p>
            </li>
            <li className="az-trace-item">
              <span className="az-trace-node" />
              <h6>Pagamento protegido</h6>
              <p>O valor só é liberado após a confirmação do recebimento.</p>
            </li>
            <li className="az-trace-item">
              <span className="az-trace-node" />
              <h6>Chat direto com o vendedor</h6>
              <p>Combine detalhes e tire dúvidas antes de fechar negócio.</p>
            </li>
          </ul>
        </div>
      </aside>

      {}
      <main className="az-form-side">
        <div className="az-auth-card">
          <div className="az-tab-switch">
            <button
              type="button"
              className={`az-tab-btn ${isSignIn ? "active" : ""}`}
              onClick={() => setMode("signin")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`az-tab-btn ${!isSignIn ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Criar conta
            </button>
          </div>

          {isSignIn ? (
            <SignInForm
              onSwitch={() => setMode("signup")}
              onAuthSuccess={onAuthSuccess}
            />
          ) : (
            <SignUpForm
              onSwitch={() => setMode("signin")}
              onAuthSuccess={onAuthSuccess}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, id, type = "text", placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className={`az-field-group ${focused ? "focused" : ""}`}>
      <label className="az-field-label" htmlFor={id}>
        <span className="node" />
        {label}
      </label>
      <div className="az-input-icon-wrap">
        <input
          id={id}
          type={inputType}
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => setFocused(Boolean(e.target.value))}
        />
        {isPassword && (
          <button
            type="button"
            className="az-toggle-pw mono"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? "OCULTAR" : "MOSTRAR"}
          </button>
        )}
      </div>
    </div>
  );
}

function SignInForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await signIn(form.email, form.password);
      saveTokens(response);
      if (onAuthSuccess) onAuthSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="az-form-title">Bem-vindo(a) de volta</div>
      <div className="az-form-caption">
        Entre com sua conta para continuar comprando
      </div>

      {error && <div className="az-error-box mono mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Field
          label="E-mail"
          id="signinEmail"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label="Senha"
          id="signinPassword"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="d-flex justify-content-between align-items-center mb-3 mt-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Lembrar de mim
            </label>
          </div>
          <a href="#!" className="az-link-cyan">
            Esqueceu a senha?
          </a>
        </div>

        <button type="submit" className="btn az-btn w-100" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="az-switch-line">
        Ainda não tem conta?{" "}
        <a href="#!" onClick={onSwitch}>
          Criar conta
        </a>
      </div>
    </>
  );
}

function formatCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function SignUpForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    rg: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.cpf.replace(/\D/g, "").length !== 11) {
      setError("Informe um CPF válido.");
      return;
    }
    if (!form.rg.trim()) {
      setError("Informe o RG.");
      return;
    }
    if (!form.acceptTerms) {
      setError("É preciso aceitar os termos de uso.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ""), 
        rg: form.rg,
      });

      saveTokens(response);
      if (onAuthSuccess) onAuthSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="az-form-title">Criar sua conta</div>
      <div className="az-form-caption">
        Leva menos de um minuto para começar a negociar.
      </div>

      {error && <div className="az-error-box mono mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Field
          label="Nome completo"
          id="signupName"
          placeholder="Seu nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Field
          label="E-mail"
          id="signupEmail"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label="Senha"
          id="signupPassword"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Field
          label="Confirmar senha"
          id="signupConfirmPassword"
          type="password"
          placeholder="Repita a senha"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <div className="d-flex gap-3">
          <div className="flex-fill">
            <Field
              label="CPF"
              id="signupCpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={(e) =>
                setForm({ ...form, cpf: formatCPF(e.target.value) })
              }
            />
          </div>
          <div className="flex-fill">
            <Field
              label="RG"
              id="signupRg"
              placeholder="00.000.000-0"
              value={form.rg}
              onChange={(e) => setForm({ ...form, rg: e.target.value })}
            />
          </div>
        </div>

        <div className="form-check mb-3 mt-1">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptTerms"
            checked={form.acceptTerms}
            onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
          />
          <label className="form-check-label" htmlFor="acceptTerms">
            Concordo com os <a href="#!" className="az-link-cyan">termos de uso</a>
          </label>
        </div>

        <button type="submit" className="btn az-btn w-100" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <div className="az-switch-line">
        Já tem conta?{" "}
        <a href="#!" onClick={onSwitch}>
          Entrar
        </a>
      </div>
    </>
  );
}
