"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              className={buttonVariants({ variant: "outline", className: "w-full mt-6" })}
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
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send reset link
              </Button>
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
