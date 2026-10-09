import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./auth-theme.css";

import logo from "./assets/logo-azneo-full.png";

import {
  signIn,
  signUp,
  saveTokens,
} from "./api.js";


export default function AuthPage({
  onAuthSuccess,
  onSignUpCompany,
  onOpenTerms,
  onOpenPrivacy,
}) {

  const [mode, setMode] =
    useState("signin");

  const isSignIn =
    mode === "signin";


  return (

    <div className="az-shell">

      <aside className="az-side">

        <svg
          className="az-circuit-bg"
          viewBox="0 0 500 700"
          xmlns="http://www.w3.org/2000/svg"
        >

          <g
            stroke="#2DD8F0"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          >
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
              alt="AZNEO"
              className="az-logo-full"
            />

          </div>


          <h1 className="az-headline">

            Compre
            <br />

            eletrônicos com{" "}

            <span className="accent">
              confiança
            </span>.

          </h1>


          <p className="az-sub">

            AZNEO conecta quem quer comprar
            periféricos e eletrônicos a quem
            procura o próximo upgrade com
            segurança em cada etapa da
            negociação.

          </p>


          <ul className="az-trace-list">

            <li className="az-trace-item">

              <span className="az-trace-node" />

              <h6>
                Produtos Confiáveis
              </h6>

              <p>
                Os produtos são verificados antes
                de anunciados na plataforma.
              </p>

            </li>


            <li className="az-trace-item">

              <span className="az-trace-node" />

              <h6>
                Pagamento protegido
              </h6>

              <p>
                O valor só é liberado após a
                confirmação do recebimento.
              </p>

            </li>


            <li className="az-trace-item">

              <span className="az-trace-node" />

              <h6>
                Sistema Intuitivo
              </h6>

              <p>
                Nosso sistema é fácil de utilizar.
              </p>

            </li>

          </ul>


          <div
            style={{
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop:
                "1px solid var(--az-border-soft)",
            }}
          >

            <p
              style={{
                fontSize: ".78rem",
                color: "var(--az-gray)",
                marginBottom: ".6rem",
              }}
            >
              Representando uma empresa?
            </p>


            <button
              type="button"

              onClick={() => {

                console.log(
                  "Clique cadastro empresa"
                );

                onSignUpCompany?.();

              }}

              style={{
                background: "transparent",
                border:
                  "1px solid var(--az-cyan-dim)",
                color: "var(--az-cyan)",
                borderRadius: "8px",
                padding: ".5rem 1.1rem",
                fontSize: ".8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >

              Cadastrar como empresa →

            </button>

          </div>

        </div>

      </aside>


      <main className="az-form-side">

        <div className="az-auth-card">

          <div className="az-tab-switch">

            <button
              type="button"

              className={
                `az-tab-btn ${
                  isSignIn
                    ? "active"
                    : ""
                }`
              }

              onClick={() =>
                setMode(
                  "signin"
                )
              }
            >

              Entrar

            </button>


            <button
              type="button"

              className={
                `az-tab-btn ${
                  !isSignIn
                    ? "active"
                    : ""
                }`
              }

              onClick={() =>
                setMode(
                  "signup"
                )
              }
            >

              Criar conta

            </button>

          </div>


          {isSignIn ? (

            <SignInForm

              onSwitch={() =>
                setMode(
                  "signup"
                )
              }

              onAuthSuccess={
                onAuthSuccess
              }

            />

          ) : (

            <SignUpForm

              onSwitch={() =>
                setMode(
                  "signin"
                )
              }

              onAuthSuccess={
                onAuthSuccess
              }

              onSignUpCompany={
                onSignUpCompany
              }

              onOpenTerms={
                onOpenTerms
              }

              onOpenPrivacy={
                onOpenPrivacy
              }

            />

          )}

        </div>

      </main>

    </div>
  );
}


// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  maxLength,
}) {

  const [focused, setFocused] =
    useState(false);

  const [visible, setVisible] =
    useState(false);

  const isPassword =
    type === "password";

  const inputType =
    isPassword
      ? visible
        ? "text"
        : "password"
      : type;


  return (

    <div
      className={
        `az-field-group ${
          focused
            ? "focused"
            : ""
        }`
      }
    >

      <label
        className="az-field-label"
        htmlFor={id}
      >

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
          maxLength={maxLength}

          onFocus={() =>
            setFocused(true)
          }

          onBlur={(e) =>
            setFocused(
              Boolean(
                e.target.value
              )
            )
          }
        />


        {isPassword && (

          <button
            type="button"
            className="az-toggle-pw mono"

            onClick={() =>
              setVisible(
                (v) => !v
              )
            }
          >

            {visible
              ? "OCULTAR"
              : "MOSTRAR"}

          </button>

        )}

      </div>

    </div>
  );
}


// =====================================================
// LOGIN
// =====================================================

function SignInForm({
  onSwitch,
  onAuthSuccess,
}) {

  const [form, setForm] =
    useState({
      email: "",
      password: "",
      rememberMe: false,
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response =
        await signIn(

          form.email
            .trim()
            .toLowerCase(),

          form.password

        );


      saveTokens(response);


      onAuthSuccess?.(
        response
      );


    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <>

      <div className="az-form-title">
        Bem-vindo(a) de volta
      </div>


      <div className="az-form-caption">
        Entre com sua conta para continuar comprando
      </div>


      {error && (

        <div className="az-error-box mono mb-3">
          {error}
        </div>

      )}


      <form onSubmit={handleSubmit}>

        <Field
          label="E-mail"
          id="signinEmail"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          maxLength={254}

          onChange={(e) =>
            setForm({
              ...form,
              email:
                e.target.value,
            })
          }
        />


        <Field
          label="Senha"
          id="signinPassword"
          type="password"
          placeholder="••••••••"
          value={form.password}
          maxLength={20}

          onChange={(e) =>
            setForm({
              ...form,

              password:
                e.target.value.replace(
                  /\s/g,
                  ""
                ),
            })
          }
        />


        <div className="d-flex justify-content-between align-items-center mb-3 mt-1">

          <div className="form-check">

            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"

              checked={
                form.rememberMe
              }

              onChange={(e) =>
                setForm({
                  ...form,

                  rememberMe:
                    e.target.checked,
                })
              }
            />


            <label
              className="form-check-label"
              htmlFor="rememberMe"
            >
              Lembrar de mim
            </label>

          </div>


          <a
            href="#!"
            className="az-link-cyan"
          >
            Esqueceu a senha?
          </a>

        </div>


        <button
          type="submit"
          className="btn az-btn w-100"
          disabled={loading}
        >

          {loading
            ? "Entrando..."
            : "Entrar"}

        </button>

      </form>


      <div className="az-switch-line">

        Ainda não tem conta?{" "}

        <a
          href="#!"
          onClick={onSwitch}
        >
          Criar conta
        </a>

      </div>

    </>
  );
}


// =====================================================
// CPF
// =====================================================

function formatCPF(value) {

  const digits =
    value
      .replace(/\D/g, "")
      .slice(0, 11);


  return digits
    .replace(
      /(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d{1,2})$/,
      "$1-$2"
    );
}


// =====================================================
// CADASTRO PESSOA FÍSICA
// =====================================================

function SignUpForm({
  onSwitch,
  onAuthSuccess,
  onSignUpCompany,
  onOpenTerms,
  onOpenPrivacy,
}) {

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      acceptTerms: false,
    });


  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();


    const cleanName =
      form.name.trim();

    const cleanEmail =
      form.email
        .trim()
        .toLowerCase();


    if (!cleanName) {

      setError(
        "Informe seu nome completo."
      );

      return;
    }


    if (
      form.password.length < 8 ||
      form.password.length > 20
    ) {

      setError(
        "A senha deve ter entre 8 e 20 caracteres."
      );

      return;
    }


    if (
      /\s/.test(
        form.password
      )
    ) {

      setError(
        "A senha não pode conter espaços."
      );

      return;
    }


    if (
      form.password !==
      form.confirmPassword
    ) {

      setError(
        "As senhas não coincidem."
      );

      return;
    }


    if (
      form.cpf
        .replace(/\D/g, "")
        .length !== 11
    ) {

      setError(
        "Informe um CPF válido."
      );

      return;
    }


    if (
      !form.acceptTerms
    ) {

      setError(
        "É preciso aceitar os Termos de Uso e a Política de Privacidade."
      );

      return;
    }


    setError("");
    setLoading(true);


    try {

      const response =
        await signUp({

          name:
            cleanName,

          email:
            cleanEmail,

          password:
            form.password,

          cpf:
            form.cpf.replace(
              /\D/g,
              ""
            ),

        });


      saveTokens(
        response
      );


      onAuthSuccess?.(
        response
      );


    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <>

      <div className="az-form-title">
        Criar sua conta
      </div>


      <div className="az-form-caption">
        Leva menos de um minuto para começar a comprar
      </div>


      {error && (

        <div className="az-error-box mono mb-3">
          {error}
        </div>

      )}


      <form onSubmit={handleSubmit}>

        <Field
          label="Nome completo"
          id="signupName"
          placeholder="Seu nome"
          value={form.name}
          maxLength={100}

          onChange={(e) =>
            setForm({
              ...form,
              name:
                e.target.value,
            })
          }
        />


        <Field
          label="E-mail"
          id="signupEmail"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          maxLength={254}

          onChange={(e) =>
            setForm({
              ...form,
              email:
                e.target.value,
            })
          }
        />


        <Field
          label="Senha"
          id="signupPassword"
          type="password"
          placeholder="8 a 20 caracteres"
          value={form.password}
          maxLength={20}

          onChange={(e) =>
            setForm({
              ...form,

              password:
                e.target.value.replace(
                  /\s/g,
                  ""
                ),
            })
          }
        />


        <Field
          label="Confirmar senha"
          id="signupConfirmPassword"
          type="password"
          placeholder="Repita a senha"
          value={form.confirmPassword}
          maxLength={20}

          onChange={(e) =>
            setForm({
              ...form,

              confirmPassword:
                e.target.value.replace(
                  /\s/g,
                  ""
                ),
            })
          }
        />


        <Field
          label="CPF"
          id="signupCpf"
          placeholder="000.000.000-00"
          value={form.cpf}
          maxLength={14}

          onChange={(e) =>
            setForm({
              ...form,

              cpf:
                formatCPF(
                  e.target.value
                ),
            })
          }
        />


        <div className="form-check mb-3 mt-2">

          <input
            className="form-check-input"
            type="checkbox"
            id="acceptTerms"

            checked={
              form.acceptTerms
            }

            onChange={(e) =>
              setForm({
                ...form,

                acceptTerms:
                  e.target.checked,
              })
            }
          />


          <label
            className="form-check-label"
            htmlFor="acceptTerms"
          >

            Li e concordo com os{" "}

          </label>


          <button
            type="button"
            onClick={
              onOpenTerms
            }
            className="az-link-cyan"

            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginLeft: "4px",
              cursor: "pointer",
            }}
          >
            Termos de Uso
          </button>


          <span>
            {" "}e com a{" "}
          </span>


          <button
            type="button"
            onClick={
              onOpenPrivacy
            }
            className="az-link-cyan"

            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            Política de Privacidade
          </button>

        </div>


        <button
          type="submit"
          className="btn az-btn w-100"
          disabled={loading}
        >

          {loading
            ? "Criando conta..."
            : "Criar conta"}

        </button>

      </form>


      <div
        style={{
          marginTop: "1.25rem",
          padding: "1rem",
          background:
            "var(--az-surface-2)",
          border:
            "1px solid var(--az-border)",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >

        <p
          style={{
            fontSize: ".78rem",
            color:
              "var(--az-gray)",
            margin:
              "0 0 .6rem",
          }}
        >
          Representando uma empresa?
        </p>


        <button
          type="button"

          onClick={() => {

            console.log(
              "Cadastro empresa pelo formulário"
            );

            onSignUpCompany?.();

          }}

          className="az-link-cyan"

          style={{
            background: "none",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >

          Cadastrar como empresa →

        </button>

      </div>


      <div className="az-switch-line mt-3">

        Já tem conta?{" "}

        <a
          href="#!"
          onClick={onSwitch}
        >
          Entrar
        </a>

      </div>

    </>
  );
}