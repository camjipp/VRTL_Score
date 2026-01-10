import { LoginForm } from "@/app/login/login-form";

export default function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const nextParam = searchParams?.next;
  const next =
    typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : undefined;

  return (
    <main className="p-6">
      <LoginForm next={next} />
    </main>
  );
}



