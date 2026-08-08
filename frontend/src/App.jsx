import { useState } from "react";
import AuthPage from "./AuthPage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";
import { getAccessToken } from "./api.js";

export default function App() {
  const [screen, setScreen] = useState(() =>
    getAccessToken() ? "catalog" : "auth"
  );

  const [selectedSlug, setSelectedSlug] = useState(null);

  if (screen === "auth") {
    return (
      <AuthPage
        onAuthSuccess={() => setScreen("catalog")}
      />
    );
  }

  if (screen === "detail") {
    return (
      <ProductDetailPage
        slug={selectedSlug}
        onBack={() => setScreen("catalog")}
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
    />
  );
}