import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default function Home() {
  const token = cookies().get("token")?.value;

  if (!token) redirect("/login");

  // Redirecionamento dependendo do usuário

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user.perfil === "CAIXA") redirect("/caixa");
    if (user.perfil === "GERENTE") redirect("/pedidos");
    if (user.perfil === "ADMIN") redirect("/registro");
  } catch {
    redirect("/login");
  }

  return null; 
}
