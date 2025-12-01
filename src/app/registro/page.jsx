"use client";

import RegisterForm from "@/components/register-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">

      <div className="absolute left-10 top-20">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="rounded-full p-3 text-lg font-extrabold mt-40"
        >
          ←
        </Button>
      </div>

      <RegisterForm />
    </div>
  );
}
