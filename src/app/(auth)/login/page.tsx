"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Wifi } from "lucide-react";
import { Btn } from "@/components/btn";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { isValidEmail } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [attempted, setAttempted] = useState(false);

  const emailError = !email.trim() ? "Email is required." : !isValidEmail(email) ? "Enter a valid email address." : null;
  const passwordError = !password ? "Password is required." : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (emailError || passwordError) return;
    router.push("/overview");
  };

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-8">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
          <Wifi size={16} className="text-sidebar-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-foreground">NetWatch</div>
          <div className="text-muted-foreground text-xs">Admin Console</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm">
            Email<RequiredMark />
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
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
              autoComplete="current-password"
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

        <Btn type="submit" size="md" className="w-full">
          Sign in
        </Btn>
      </form>
    </div>
  );
}
