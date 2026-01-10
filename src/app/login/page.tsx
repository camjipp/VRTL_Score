import { LoginForm } from "@/components/LoginForm";

type LoginPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawNext = searchParams?.next;
  const nextParam = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const nextPath = typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/app";

  return (
    <main className="p-6">
      <LoginForm nextPath={nextPath} />
    </main>
  );
}



