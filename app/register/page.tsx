"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    gender: z.enum(["male", "female", "other"], { message: "Select a gender" }),
    dob: z.string().optional(),
    terms: z.literal(true, { message: "You must accept the terms to continue" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [pwValue, setPwValue] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await registerUser({
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      password: data.password,
      gender: data.gender,
      dob: data.dob,
    });
    if (!result.success) {
      setServerError(result.message || "Registration failed. Please try again.");
      return;
    }
    router.push("/account/profile");
  }

  const strength = passwordStrength(pwValue);
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][Math.max(0, strength - 1)] || "Weak";
  const strengthColor = ["bg-km-danger", "bg-km-warn", "bg-km-blue-light", "bg-km-success"][Math.max(0, strength - 1)] || "bg-km-danger";

  return (
    <div className="grid lg:grid-cols-2 min-h-[70vh]">
      <div className="hidden lg:flex flex-col justify-center items-center bg-km-blue p-12">
        <Logo theme="dark" className="scale-150 mb-6" />
        <h2 className="font-heading font-semibold text-2xl text-white text-center">
          Join KartME today
        </h2>
        <p className="text-white/80 text-center mt-2 max-w-sm">
          Create an account for faster checkout, order tracking and exclusive member offers.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="lg:hidden mb-6"><Logo /></div>
        <h1 className="font-heading font-semibold text-2xl mb-1">Create your account</h1>
        <p className="text-sm text-km-muted mb-6">It only takes a minute</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <input {...register("fullName")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="Priya Sharma" />
            {errors.fullName && <p className="text-xs text-km-danger mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Mobile Number</label>
            <input {...register("mobile")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="9876543210" />
            {errors.mobile && <p className="text-xs text-km-danger mt-1">{errors.mobile.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input {...register("email")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="you@email.com" />
            {errors.email && <p className="text-xs text-km-danger mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <select {...register("gender")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-km-danger mt-1">{errors.gender.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date of Birth <span className="text-km-muted">(optional)</span></label>
              <input type="date" {...register("dob")} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPwValue(e.target.value)}
                className="w-full border border-km-line rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-km-blue-light"
                placeholder="At least 8 characters"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-km-muted">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwValue && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-km-line overflow-hidden">
                  <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 4) * 100}%` }} />
                </div>
                <span className="text-xs text-km-muted">{strengthLabel}</span>
              </div>
            )}
            {errors.password && <p className="text-xs text-km-danger mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Confirm Password</label>
            <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} className="w-full border border-km-line rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-km-blue-light" placeholder="Re-enter password" />
            {errors.confirmPassword && <p className="text-xs text-km-danger mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" {...register("terms")} className="mt-0.5" />
            <span>I agree to the <Link href="/terms" className="text-km-blue hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-km-blue hover:underline">Privacy Policy</Link></span>
          </label>
          {errors.terms && <p className="text-xs text-km-danger">{errors.terms.message}</p>}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>
        </form>

        {serverError && (
          <p className="text-sm text-km-danger mt-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        <p className="text-sm text-km-muted mt-6">
          Already have an account? <Link href="/login" className="text-km-blue font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
