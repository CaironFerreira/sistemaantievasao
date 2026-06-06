import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="space-y-6 p-8 sm:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Acesso ao Painel
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use suas credenciais institucionais para acessar o sistema.
          </p>
        </div>
        <LoginForm callbackUrl={params.callbackUrl} />
      </CardContent>
    </Card>
  );
}
