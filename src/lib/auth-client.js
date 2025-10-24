// src/lib/auth-client.js CORRIGIDO
import Cookies from 'js-cookie';

/**
 * Obtém os dados do usuário logado armazenados no sessionStorage
 * @returns {Object|null} Dados do usuário ou null se não estiver logado
 */
export function getLoggedUser() {
	if (typeof window === "undefined") return null;

	try {
		// O token principal de autenticação agora está no Cookie (HttpOnly)
		const token = Cookies.get("token"); 
		// Os dados não sensíveis do usuário são salvos no sessionStorage pelo LoginForm
		const userString = sessionStorage.getItem("user"); 

		if (!token || !userString) return null;

		const user = JSON.parse(userString);
		return user;
	} catch (error) {
		console.error("Erro ao obter usuário logado:", error);
		return null;
	}
}

/**
 * Salva os dados do usuário no sessionStorage após login.
 * NOTA: O TOKEN JWT PRINCIPAL É SALVO PELO BACKEND COMO COOKIE HTTP.
 * @param {Object} user - Dados do usuário
 */
export function saveUserData(user) {
	if (typeof window === "undefined") return;

	// O token não é mais salvo aqui, apenas os dados do usuário.
	sessionStorage.setItem("user", JSON.stringify(user));
}

/**
 * Remove os dados do usuário (logout) e o token (via Cookie).
 */
export function clearUserData() {
	if (typeof window === "undefined") return;

	// Remove os dados do sessionStorage
	sessionStorage.removeItem("user");
    
    // Remove o token do Cookie.
    // NOTE: Se o backend tiver um endpoint de logout, é melhor chamá-lo
    // para limpar o cookie de forma mais segura.
	Cookies.remove("token"); 
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
	if (typeof window === "undefined") return false;

	// A autenticação é baseada na presença do token no Cookie
	const token = Cookies.get("token");
	return !!token;
}

/**
 * Obtém apenas o token
 * @returns {string|null}
 */
export function getToken() {
	if (typeof window === "undefined") return null;

	// Obtém o token do Cookie
	return Cookies.get("token");
}