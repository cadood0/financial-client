import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { GuestGuard } from "@/components/auth/guest-guard";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/modules/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <GuestGuard>
      <div className="grid min-h-dvh lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#5D7C8E] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.18),transparent_40%)]"
          />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-md bg-white/15">
                <FileText className="size-4" />
              </span>
              <p className="text-xl font-semibold tracking-tight">FinAdmin</p>
            </div>
            <h1 className="mt-16 max-w-md text-3xl leading-snug font-semibold">
              The Financial Contribution Management System built for clarity and
              control.
            </h1>
          </div>

          <blockquote className="relative max-w-md rounded-2xl bg-white/10 p-6 text-sm leading-relaxed text-white/90 backdrop-blur-sm">
            <p>
              &ldquo;Elegance is not being noticed, it&apos;s being remembered.
              Our financial tools follow the same philosophy.&rdquo;
            </p>
            <footer className="mt-4 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
              — Scandinavian Core
            </footer>
          </blockquote>
        </aside>

        <div className="bg-background flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Enter your credentials to access the management portal.
              </p>
            </div>

            <LoginForm />

            <Separator className="my-8" />
            <p className="text-muted-foreground text-center text-xs">
              © {new Date().getFullYear()} Financial Contribution Management
              System.{" "}
              <span className="text-foreground font-medium">FinAdmin v2.4.0</span>
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
