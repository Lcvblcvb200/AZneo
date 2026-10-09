import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./auth-theme.css";

import logo from "./assets/logo-azneo-full.png";

import {
  saveTokens,
} from "./api.js";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


// =====================================================
// CNPJ
// =====================================================

function formatCNPJ(value) {

  const digits =
    value
      .replace(/\D/g, "")
      .slice(0, 14);


  return digits
    .replace(
      /(\d{2})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d)/,
      "$1/$2"
    )
    .replace(
      /(\d{4})(\d{1,2})$/,
      "$1-$2"
    );
}


// =====================================================
// INSCRIÇÃO ESTADUAL
// =====================================================

function formatIE(value) {

  return value
    .replace(/\D/g, "")
    .slice(0, 14);
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
// PAGE
// =====================================================

export default function SignUpCompanyPage({
  onAuthSuccess,
  onBack,
  onOpenTerms,
  onOpenPrivacy,
}) {

  const [form, setForm] =
    useState({
      name_f: "",
      name_s: "",
      email: "",
      password: "",
      confirmPassword: "",
      cnpj: "",
      ie: "",
      acceptTerms: false,
    });


  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const cleanName =
      form.name_f.trim();

    const cleanSurname =
      form.name_s.trim();

    const cleanEmail =
      form.email
        .trim()
        .toLowerCase();

    const cleanCNPJ =
      form.cnpj.replace(
        /\D/g,
        ""
      );

    const cleanIE =
      form.ie.replace(
        /\D/g,
        ""
      );


    if (!cleanName) {

      setError(
        "Informe o nome do responsável."
      );

      return;
    }


    if (!cleanSurname) {

      setError(
        "Informe o sobrenome do responsável."
      );

      return;
    }


    if (!cleanEmail) {

      setError(
        "Informe o e-mail corporativo."
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
      cleanCNPJ.length !== 14
    ) {

      setError(
        "Informe um CNPJ com 14 dígitos."
      );

      return;
    }


    if (!cleanIE) {

      setError(
        "Informe a Inscrição Estadual."
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
        await fetch(
          `${API_URL}/auth/signupcompany`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                name_f:
                  cleanName,

                name_s:
                  cleanSurname,

                email:
                  cleanEmail,

                password:
                  form.password,

                cnpj:
                  cleanCNPJ,

                ie:
                  cleanIE,

              }),
          }
        );


      const data =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Erro ao criar conta empresarial."
        );

      }


      saveTokens(data);


      onAuthSuccess?.(
        data
      );


    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // JSX
  // ===================================================

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

            Cadastre sua
            <br />

            <span className="accent">
              empresa
            </span>.

          </h1>


          <p className="az-sub">

            Crie uma conta empresarial
            na AZNEO para realizar compras
            utilizando os dados da sua empresa.

          </p>

          <button
            type="button"
            onClick={onBack}

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
              marginTop: "2rem",
            }}
          >

            ← Voltar para login

          </button>

        </div>

      </aside>


      <main
        className="az-form-side"
        style={{
          overflowY: "auto",
          height: "100vh",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >

        <div className="az-auth-card">

          <div className="az-form-title">

            Criar conta empresarial

          </div>


          <div className="az-form-caption">

            Preencha os dados do responsável
            e da empresa

          </div>


          {error && (

            <div className="az-error-box mono mb-3">
              {error}
            </div>

          )}


          <form onSubmit={handleSubmit}>

            <Field
              label="Nome Fantasia"
              id="companyNameF"
              placeholder="Madureira Eletronics"
              value={form.name_f}
              maxLength={50}

              onChange={(e) =>
                setForm({
                  ...form,

                  name_f:
                    e.target.value,
                })
              }
            />


            <Field
              label="Razão Social"
              id="companyNameS"
              placeholder="Razão Social Da Sua Empresa"
              value={form.name_s}
              maxLength={100}

              onChange={(e) =>
                setForm({
                  ...form,

                  name_s:
                    e.target.value,
                })
              }
            />


            <Field
              label="E-mail corporativo"
              id="companyEmail"
              type="email"
              placeholder="contato@empresa.com.br"
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
              id="companyPassword"
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
              id="companyConfirmPassword"
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
              label="CNPJ"
              id="companyCnpj"
              placeholder="00.000.000/0000-00"
              value={form.cnpj}
              maxLength={18}

              onChange={(e) =>
                setForm({
                  ...form,

                  cnpj:
                    formatCNPJ(
                      e.target.value
                    ),
                })
              }
            />


            <Field
              label="Inscrição Estadual"
              id="companyIe"
              placeholder="00000000000000"
              value={form.ie}
              maxLength={14}

              onChange={(e) =>
                setForm({
                  ...form,

                  ie:
                    formatIE(
                      e.target.value
                    ),
                })
              }
            />


            <div
              className="form-check mb-3 mt-2"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: ".45rem",
              }}
            >

              <input
                className="form-check-input"
                type="checkbox"
                id="companyAcceptTerms"

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


              <div
                style={{
                  fontSize: ".82rem",
                  lineHeight: "1.5",
                }}
              >

                <label
                  htmlFor="companyAcceptTerms"

                  style={{
                    color:
                      "var(--az-gray)",
                    cursor:
                      "pointer",
                  }}
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
                    cursor: "pointer",
                    fontSize: "inherit",
                  }}
                >

                  Termos de Uso

                </button>


                <span
                  style={{
                    color:
                      "var(--az-gray)",
                  }}
                >

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
                    fontSize: "inherit",
                  }}
                >

                  Política de Privacidade

                </button>

                <span>.</span>

              </div>

            </div>


            <button
              type="submit"
              className="btn az-btn w-100"
              disabled={loading}
            >

              {loading
                ? "Criando conta..."
                : "Criar conta empresarial"}

            </button>

          </form>


          <div className="az-switch-line mt-3">

            Já possui uma conta?{" "}

            <a
              href="#!"

              onClick={(e) => {

                e.preventDefault();

                onBack?.();

              }}
            >

              Entrar

            </a>

          </div>

        </div>

      </main>

    </div>
  );
}