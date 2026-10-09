import { useEffect, useState } from "react";

import AuthPage from "./AuthPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";
import ProductFormPage from "./ProductFormPage.jsx";
import CartPage from "./CartPage.jsx";
import SignUpCompanyPage from "./SignUpCompanyPage.jsx";

import PrivacyPolicyPage from "./PrivacyPolicyPage.jsx";
import TermsOfUsePage from "./TermsOfUsePage.jsx";

import {
  getAccessToken,
  getProfile,
  getCart,
  logout,
} from "./api.js";


// =========================================================
// CONTAR ITENS DO CARRINHO
// =========================================================

function countItems(cart) {
  if (!cart?.items) {
    return 0;
  }

  return cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}


// =========================================================
// APP
// =========================================================

export default function App() {

  // -------------------------------------------------------
  // TELA ATUAL
  // -------------------------------------------------------

  const [screen, setScreen] = useState(() => {
    return getAccessToken()
      ? "catalog"
      : "auth";
  });


  // -------------------------------------------------------
  // TELA PARA A QUAL VOLTAR APÓS TERMOS / PRIVACIDADE
  // -------------------------------------------------------

  const [
    legalReturnScreen,
    setLegalReturnScreen,
  ] = useState("auth");


  // -------------------------------------------------------
  // PRODUTO SELECIONADO
  // -------------------------------------------------------

  const [
    selectedSlug,
    setSelectedSlug,
  ] = useState(null);


  // -------------------------------------------------------
  // PRODUTO SENDO EDITADO
  // -------------------------------------------------------

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);


  // -------------------------------------------------------
  // USUÁRIO LOGADO
  // -------------------------------------------------------

  const [
    profile,
    setProfile,
  ] = useState(null);


  // -------------------------------------------------------
  // ADMIN
  // -------------------------------------------------------

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);


  // -------------------------------------------------------
  // QUANTIDADE DO CARRINHO
  // -------------------------------------------------------

  const [
    cartCount,
    setCartCount,
  ] = useState(0);


  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {

    const token = getAccessToken();

    // Se não existe token,
    // não tenta carregar perfil nem carrinho.
    if (!token) {
      return;
    }


    const loadUser = async () => {

      try {

        // -----------------------------------------------
        // PERFIL
        // -----------------------------------------------

        const userProfile =
          await getProfile();


        // Guardamos o perfil inteiro.
        setProfile(userProfile);


        setIsAdmin(
          userProfile.role === "admin"
        );


        // -----------------------------------------------
        // CARRINHO
        // -----------------------------------------------

        try {

          const cart =
            await getCart();


          setCartCount(
            countItems(cart)
          );

        } catch {

          setCartCount(0);

        }


      } catch {

        // Token inválido ou expirado.
        logout();

        setProfile(null);
        setIsAdmin(false);
        setCartCount(0);


        setScreen((currentScreen) => {

          if (
            currentScreen === "signup-company" ||
            currentScreen === "terms" ||
            currentScreen === "privacy"
          ) {
            return currentScreen;
          }

          return "auth";
        });

      }
    };


    loadUser();

  }, []);


  // =========================================================
  // LOGIN / CADASTRO CONCLUÍDO
  // =========================================================

  const handleAuthSuccess = async () => {

    // -------------------------------------------------------
    // CARREGAR PERFIL
    // -------------------------------------------------------

    try {

      const userProfile =
        await getProfile();


      setProfile(userProfile);


      setIsAdmin(
        userProfile.role === "admin"
      );

    } catch {

      setProfile(null);
      setIsAdmin(false);

    }


    // -------------------------------------------------------
    // CARREGAR CARRINHO
    // -------------------------------------------------------

    try {

      const cart =
        await getCart();


      setCartCount(
        countItems(cart)
      );

    } catch {

      setCartCount(0);

    }


    // Depois de login/cadastro,
    // entra no catálogo.
    setScreen("catalog");
  };


  // =========================================================
  // ALTERAÇÃO NO CARRINHO
  // =========================================================

  const handleCartChange = (cart) => {

    setCartCount(
      countItems(cart)
    );
  };


  // =========================================================
  // ABRIR TERMOS
  // =========================================================

  const openTerms = (returnScreen) => {

    setLegalReturnScreen(
      returnScreen
    );

    setScreen("terms");
  };


  // =========================================================
  // ABRIR PRIVACIDADE
  // =========================================================

  const openPrivacy = (returnScreen) => {

    setLegalReturnScreen(
      returnScreen
    );

    setScreen("privacy");
  };


  // =========================================================
  // TERMOS DE USO
  // =========================================================

  if (screen === "terms") {

    return (

      <TermsOfUsePage
        onBack={() =>
          setScreen(
            legalReturnScreen
          )
        }
      />

    );
  }


  // =========================================================
  // POLÍTICA DE PRIVACIDADE
  // =========================================================

  if (screen === "privacy") {

    return (

      <PrivacyPolicyPage
        onBack={() =>
          setScreen(
            legalReturnScreen
          )
        }
      />

    );
  }


  // =========================================================
  // LOGIN / CADASTRO PESSOA FÍSICA
  // =========================================================

  if (screen === "auth") {

    return (

      <AuthPage
        onAuthSuccess={
          handleAuthSuccess
        }

        onSignUpCompany={() => {
          setScreen(
            "signup-company"
          );
        }}

        onOpenTerms={() => {
          openTerms(
            "auth"
          );
        }}

        onOpenPrivacy={() => {
          openPrivacy(
            "auth"
          );
        }}
      />

    );
  }


  // =========================================================
  // CADASTRO EMPRESA
  // =========================================================

  if (
    screen ===
    "signup-company"
  ) {

    return (

      <SignUpCompanyPage
        onAuthSuccess={
          handleAuthSuccess
        }

        onBack={() => {
          setScreen(
            "auth"
          );
        }}

        onOpenTerms={() => {
          openTerms(
            "signup-company"
          );
        }}

        onOpenPrivacy={() => {
          openPrivacy(
            "signup-company"
          );
        }}
      />

    );
  }


  // =========================================================
  // DETALHES DO PRODUTO
  // =========================================================

  if (screen === "detail") {

    return (

      <ProductDetailPage
        slug={
          selectedSlug
        }

        profile={
          profile
        }

        onBack={() => {
          setScreen(
            "catalog"
          );
        }}

        onEdit={
          isAdmin

            ? (product) => {

                setEditingProduct(
                  product
                );

                setScreen(
                  "form"
                );
              }

            : undefined
        }

        onDeleted={
          isAdmin

            ? () => {

                setScreen(
                  "catalog"
                );
              }

            : undefined
        }

        onOpenCart={() => {
          setScreen(
            "cart"
          );
        }}

        onCartChange={
          handleCartChange
        }

        cartCount={
          cartCount
        }

        onRequireAuth={() => {

          setProfile(null);
          setIsAdmin(false);

          setScreen(
            "auth"
          );
        }}
      />

    );
  }


  // =========================================================
  // FORMULÁRIO DE PRODUTO
  // =========================================================

  if (screen === "form") {

    return (

      <ProductFormPage
        mode={
          editingProduct
            ? "edit"
            : "create"
        }

        product={
          editingProduct
        }

        onCancel={() => {

          setScreen(
            editingProduct
              ? "detail"
              : "catalog"
          );
        }}

        onDone={(product) => {

          setEditingProduct(
            null
          );

          setSelectedSlug(
            product.slug
          );

          setScreen(
            "detail"
          );
        }}
      />

    );
  }


  // =========================================================
  // CARRINHO
  // =========================================================

  if (screen === "cart") {

    return (

      <CartPage
        onBack={() => {
          setScreen(
            "catalog"
          );
        }}

        onCartChange={
          handleCartChange
        }

        onRequireAuth={() => {

          setProfile(null);
          setIsAdmin(false);

          setScreen(
            "auth"
          );
        }}
      />

    );
  }


  // =========================================================
  // CATÁLOGO
  // =========================================================

  return (

    <CatalogPage

      onRequireAuth={() => {

        setProfile(null);
        setIsAdmin(false);

        setScreen(
          "auth"
        );
      }}

      onProductSelect={(slug) => {

        setSelectedSlug(
          slug
        );

        setScreen(
          "detail"
        );
      }}

      onAddProduct={
        isAdmin

          ? () => {

              setEditingProduct(
                null
              );

              setScreen(
                "form"
              );
            }

          : undefined
      }

      onOpenCart={() => {

        setScreen(
          "cart"
        );
      }}

      onCartChange={
        handleCartChange
      }

      cartCount={
        cartCount
      }

    />

  );
}