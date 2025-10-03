import  RegisterForm  from "@/components/register-form"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 p-4")}>
      <RegisterForm />
    </div>
  )
}
 