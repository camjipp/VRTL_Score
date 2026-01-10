import type { PageProps } from "next";

import { LoginForm } from "@/components/LoginForm";

export default function LoginPage({
  searchParams
}: PageProps<{ next?: string }>) {
  const nextParam = searchParams?.next;
  const nextPath =
    typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/app";

  return (
    <main className="p-6">
      <LoginForm nextPath={nextPath} />
    </main>
  );
}



