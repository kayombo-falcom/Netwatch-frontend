"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Btn } from "@/components/btn";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { isValidEmail } from "@/lib/validation";
import { toast } from "@/lib/toast-store";

/** Reads the `?reason=password-changed` redirect flag — split out because `useSearchParams()` needs its own Suspense boundary for prerendering. */
function PasswordChangedNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reason") !== "password-changed") return;
    toast.info("Password changed", "Please sign in again with your new password.");
    router.replace("/login");
  }, [searchParams, router]);

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Chrome ignores autocomplete="off" and fills a recognized login form on
  // load itself when a matching saved credential exists. Keeping the fields
  // readOnly until the user actually focuses them stops that — Chrome won't
  // autofill a field it can't write to at parse time.
  const [emailLocked, setEmailLocked] = useState(true);
  const [passwordLocked, setPasswordLocked] = useState(true);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      const body = await res.json();
      if (!res.ok) {
        toast.error("Sign in failed", body.error ?? "Something went wrong. Please try again.");
        return;
      }
      toast.success("Signed in", `Welcome back, ${body.name ?? email}.`);
      router.push("/overview");
    } catch {
      toast.error("Sign in failed", "Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-card/95 dark:bg-card/75 backdrop-blur-3xl border border-border/60 rounded-2xl shadow-xl shadow-black/10 p-8">
      <Suspense fallback={null}>
        <PasswordChangedNotice />
      </Suspense>
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
            readOnly={emailLocked}
            onFocus={() => { setEmailLocked(false); setPasswordLocked(false); }}
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
              autoComplete="off"
              readOnly={passwordLocked}
              onFocus={() => { setPasswordLocked(false); setEmailLocked(false); }}
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
