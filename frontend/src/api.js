// Backend FastAPI base URL. In development, FastAPI usually runs on
// http://localhost:8000 (or http://127.0.0.1:8000).
// Can be changed without touching the code: edit the .env file.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Central function that performs HTTP requests to the backend.
 * Every other function in this file uses it under the hood.
 */
async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // The backend should respond in JSON. If parsing fails, fall back to
  // null and handle it as a generic error below.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // FastAPI usually returns errors as { "detail": "message" }
    const message =
      (data && (data.detail || data.message)) ||
      "Could not reach the server. Please try again.";
    const error = new Error(
      typeof message === "string" ? message : "Error processing the request."
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Sends email and password to the backend (real route: POST /auth/signin)
 * and receives the token back.
 */
export function signIn(email, password) {
  return request("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Sends the signup data to the backend (real route: POST /auth/signup).
 * The field names below (name, email, password, cpf, rg) match your
 * SignUpSchema in auth_schemas.py.
 */
export function signUp({ name, email, password, cpf, rg }) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, cpf, rg }),
  });
}

/**
 * Stores the JWT token in the browser for the next requests.
 * Your backend only returns access_token (no refresh_token for now).
 * localStorage is the simplest way to start; later, for better
 * protection against XSS, you can migrate to httpOnly cookies
 * (in that case the backend itself sets the cookie).
 */
export function saveTokens({ access_token }) {
  if (access_token) localStorage.setItem("az_access_token", access_token);
}

export function getAccessToken() {
  return localStorage.getItem("az_access_token");
}

export function logout() {
  localStorage.removeItem("az_access_token");
}

/**
 * Fetches the product catalog (real route: GET /products/view).
 * This route is protected — it requires the logged-in user's token.
 */
export function getProducts() {
  const token = getAccessToken();
  return request("/products/view", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Searches products by name (real route: GET /products/search?name=...).
 * This route is protected — it requires the logged-in user's token.
 */
export function searchProducts(name) {
  const token = getAccessToken();
  const query = new URLSearchParams({ name });
  return request(`/products/search?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Fetches a single product by its slug (real route: GET /products/product/{slug}).
 * This route is public — no token required. Used for the product detail page.
 */
export function getProductBySlug(slug) {
  return request(`/products/product/${encodeURIComponent(slug)}`);
}

export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/**
 * Creates a new product (real route: POST /products/register).
 * Protected — requires the logged-in user's token. Expects a
 * FormData instance (multipart/form-data) built by the caller.
 */
export function createProduct(formData) {
  const token = getAccessToken();
  return request("/products/register", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

/**
 * Updates an existing product (real route: PUT /products/update/{id}).
 * Protected — requires the logged-in user's token. Expects a
 * FormData instance (multipart/form-data) built by the caller.
 */
export function updateProduct(productId, formData) {
  const token = getAccessToken();
  return request(`/products/update/${productId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

/**
 * Deletes a product (real route: DELETE /products/delete/{id}).
 * Protected — requires the logged-in user's token.
 */
export function deleteProduct(productId) {
  const token = getAccessToken();
  return request(`/products/delete/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Calls the protected GET /auth/profile route, which requires the
 * logged-in user's token (validated by your token_verify dependency).
 */
export function getProfile() {
  const token = getAccessToken();
  return request("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
