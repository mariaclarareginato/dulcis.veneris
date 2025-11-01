// src/app/registro/page.jsx
import RegisterForm from "@/components/register-form";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterPage() {



  return <RegisterForm />;
}
