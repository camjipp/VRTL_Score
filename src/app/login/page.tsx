import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : undefined;

  const nextParam = sp?.next;
  const nextStr = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  // allow only internal paths to prevent open redirects
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/app";

  return <LoginForm nextPath={nextPath} />;
}



