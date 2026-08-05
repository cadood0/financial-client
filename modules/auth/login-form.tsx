"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "@/components/shared/toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const remember = useWatch({ control: form.control, name: "remember" });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      await login(
        { email: values.email, password: values.password },
        values.remember,
      );
      toast.success("Signed in successfully");
    } catch (error) {
      let message = "Unable to sign in. Please try again.";
      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { error?: string } | undefined)?.error ??
          message;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@organization.com"
            className="h-11 rounded-lg pl-10"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label
            htmlFor="password"
            className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase"
          >
            Password
          </Label>
          <span className="text-primary/80 text-sm">Forgot password?</span>
        </div>
        <div className="relative">
          <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 rounded-lg pl-10"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password ? (
          <p className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox
          checked={remember}
          onCheckedChange={(checked) =>
            form.setValue("remember", checked === true, {
              shouldDirty: true,
            })
          }
        />
        <span className="text-foreground/80">Remember this device.</span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-11 w-full gap-2 text-sm font-semibold"
      >
        {submitting ? "Signing in..." : "Sign In"}
        <ArrowRight data-icon="inline-end" className="size-4" />
      </Button>
    </form>
  );
}
