// src/lib/auth-client.js

/**
 * Obtém os dados do usuário logado armazenados no localStorage
 * @returns {Object|null} Dados do usuário ou null se não estiver logado
 */
export function getLoggedUser() {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) return null;

    const user = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error("Erro ao obter usuário logado:", error);
    return null;
  }
}

/**
 * Salva os dados do usuário no localStorage após login
 * @param {string} token - Token JWT
 * @param {Object} user - Dados do usuário
 */
export function saveUserData(token, user) {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Remove os dados do usuário (logout)
 */
export function clearUserData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("token");
  return !!token;
}

/**
 * Obtém apenas o token
 * @returns {string|null}
 */
export function getToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}
