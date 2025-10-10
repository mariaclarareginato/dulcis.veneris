// src/app/registro/page.jsx
import RegisterForm from "@/components/register-form";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  // ⚡ pega cookies do request
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  // ⚡ valida token e pega dados do usuário
  const currentUser = await getCurrentUser(token);

  // ⚡ se não estiver logado, redireciona automaticamente
  if (!currentUser) {
    redirect("/login");
  }

  // ⚡ passa o usuário pro Client Component
  return <RegisterForm currentUser={currentUser} />;
}
