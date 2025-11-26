import Cookies from "js-cookie";

/**
 * Obtém os dados do usuário logado armazenados no sessionStorage
 */
export function getLoggedUser() {
  if (typeof window === "undefined") return null;

  try {
    const userString = sessionStorage.getItem("user");
    if (!userString) return null;

    const user = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error("Erro ao obter usuário logado:", error);
    sessionStorage.removeItem("user");
    return null;
  }
}

/**
 * Salva os dados do usuário no sessionStorage após login
 */
export function saveUserData(user) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("user", JSON.stringify(user));
}

/**
 * Realiza o logout completo
 */
export async function logout() {
  if (typeof window === "undefined") return;

  try {
    // 1. Chama a API de logout para limpar o cookie do servidor
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    // 2. Limpa o sessionStorage
    sessionStorage.removeItem("user");

    // 3. Limpa o cookie do lado do cliente (redundância)
    Cookies.remove("token");

    // 4. Redireciona para a página de login
    window.location.href = "/login";
  } catch (error) {
    console.error("Erro ao fazer logout:", error);

    // Mesmo com erro, limpa os dados locais e redireciona
    sessionStorage.removeItem("user");
    Cookies.remove("token");
    window.location.href = "/login";
  }
}

/**
 * Remove os dados do usuário (versão antiga - mantida para compatibilidade)
 */
export function clearUserData() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("user");
  Cookies.remove("token");
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  const token = Cookies.get("token");
  return !!token;
}

/**
 * Obtém apenas o token
 */
export function getToken() {
  if (typeof window === "undefined") return null;
  return Cookies.get("token");
}
