"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Btn } from "@/components/btn";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { isValidEmail } from "@/lib/validation";
import { toast } from "@/lib/toast-store";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") !== "password-changed") return;
    toast.info("Password changed", "Please sign in again with your new password.");
    router.replace("/login");
  }, [searchParams, router]);

  const emailError = !email.trim() ? "Email is required." : !isValidEmail(email) ? "Enter a valid email address." : null;
  const passwordError = !password ? "Password is required." : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (emailError || passwordError) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error("Sign in failed", error ?? "Something went wrong. Please try again.");
        return;
      }
      toast.success("Signed in", `Welcome back, ${email}.`);
      router.push("/overview");
    } catch {
      toast.error("Sign in failed", "Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-8">
      <img src="/brand/logo-stacked-navy.png" alt="NetWatch" className="h-28 w-auto mx-auto mb-6 dark:hidden" />
      <img src="/brand/logo-stacked-mint.png" alt="NetWatch" className="h-28 w-auto mx-auto mb-6 hidden dark:block" />

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm">
            Email<RequiredMark />
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="off"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            aria-invalid={(touched.email || attempted) && !!emailError}
            required
          />
          {(touched.email || attempted) && <FieldError message={emailError ?? undefined} />}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm">
              Password<RequiredMark />
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              className="pr-9"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              aria-invalid={(touched.password || attempted) && !!passwordError}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {(touched.password || attempted) && <FieldError message={passwordError ?? undefined} />}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me
          </label>
        </div>

        <Btn type="submit" size="md" className="w-full" disabled={submitting}>
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Sign in
        </Btn>
      </form>
    </div>
  );
}
