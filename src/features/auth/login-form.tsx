"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { loginSchema } from "@/lib/validators";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const redirectTo = callbackUrl ?? "/dashboard";

    const result = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl: redirectTo,
    });

    if (!result || result.error) {
      setError("Nao foi possivel autenticar com as credenciais informadas.");
      return;
    }

    router.push(result.url ?? redirectTo);
    router.refresh();
  });

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="nome@instituicao.edu.br" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" placeholder="********" {...register("password")} />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
