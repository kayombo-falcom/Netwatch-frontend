"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Btn, btnClasses } from "@/components/btn";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { isValidEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const emailError = !email.trim() ? "Email is required." : !isValidEmail(email) ? "Enter a valid email address." : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (emailError) return;
    setSent(true);
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="w-full bg-card border border-border rounded-2xl shadow-sm p-8">
        {sent ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reset link sent to <span className="text-foreground font-medium">{email}</span>
            </p>
            <Link
              href="/login"
              className={btnClasses({ variant: "outline", size: "md", className: "w-full mt-6" })}
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">Reset password</h1>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  onBlur={() => setTouched(true)}
                  aria-invalid={(touched || attempted) && !!emailError}
                  required
                />
                {(touched || attempted) && <FieldError message={emailError ?? undefined} />}
              </div>

              <Btn type="submit" size="md" className="w-full">
                Send reset link
              </Btn>
            </form>
          </>
        )}
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-6"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>
    </div>
  );
}
