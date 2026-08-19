"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  identifier: z.string().min(3, "Enter your mobile number or email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account/profile";
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await login(data.identifier, data.password);
    if (!result.success) {
      setServerError(result.message || "Login failed. Please try again.");
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[70vh]">
      <div className="hidden lg:flex flex-col justify-center items-center bg-km-blue p-12">
        <Logo theme="dark" className="scale-150 mb-6" />
        <h2 className="font-heading font-semibold text-2xl text-white text-center">
          Welcome back to KartME
        </h2>
        <p className="text-white/80 text-center mt-2 max-w-sm">
          Log in to track your orders, manage your wishlist and enjoy a faster checkout.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="lg:hidden mb-6"><Logo /></div>
        <h1 className="font-heading font-semibold text-2xl mb-1">Login to your account</h1>
        <p className="text-sm text-km-muted mb-6">Enter your details to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <div>
            <label className="text-sm font-medium mb-1 block">Mobile Number or Email</label>
            <input
              {...register("identifier")}
              className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
              placeholder="9876543210 or you@email.com"
            />
            {errors.identifier && <p className="text-xs text-km-danger mt-1">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="w-full border border-km-line rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-km-muted">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-km-danger mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("remember")} /> Remember me
            </label>
            <Link href="#" className="text-km-blue hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Login
          </Button>
        </form>

        {serverError && (
          <p className="text-sm text-km-danger mt-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        <p className="text-sm text-km-muted mt-6">
          New to KartME? <Link href="/register" className="text-km-blue font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
