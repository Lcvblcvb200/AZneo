import { useEffect, useState } from "react";
import AuthPage from "./AuthPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";
import ProductFormPage from "./ProductFormPage.jsx";
import { getAccessToken, getProfile, logout } from "./api.js";

export default function App() {
  const [screen, setScreen] = useState(() => (getAccessToken() ? "catalog" : "auth"));
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) return;
    getProfile()
      .then((profile) => setIsAdmin(profile.role === "admin"))
      .catch(() => {
        logout();
        setScreen("auth");
      });
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const profile = await getProfile();
      setIsAdmin(profile.role === "admin");
    } catch {
      setIsAdmin(false);
    }
    setScreen("catalog");
  };

  if (screen === "auth") {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (screen === "detail") {
    return (
      <ProductDetailPage
        slug={selectedSlug}
        onBack={() => setScreen("catalog")}
        onEdit={
          isAdmin
            ? (product) => {
                setEditingProduct(product);
                setScreen("form");
              }
            : undefined
        }
        onDeleted={isAdmin ? () => setScreen("catalog") : undefined}
      />
    );
  }

  if (screen === "form") {
    return (
      <ProductFormPage
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
        onCancel={() => setScreen(editingProduct ? "detail" : "catalog")}
        onDone={(product) => {
          setEditingProduct(null);
          setSelectedSlug(product.slug);
          setScreen("detail");
        }}
      />
    );
  }

  return (
    <CatalogPage
      onRequireAuth={() => setScreen("auth")}
      onProductSelect={(slug) => {
        setSelectedSlug(slug);
        setScreen("detail");
      }}
      onAddProduct={
        isAdmin
          ? () => {
              setEditingProduct(null);
              setScreen("form");
            }
          : undefined
      }
    />
  );
}
