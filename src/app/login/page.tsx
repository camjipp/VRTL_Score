import { LoginForm } from "@/components/LoginForm";

type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : undefined;

  const nextParam = sp?.next;
  const nextStr = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  // allow only internal paths to prevent open redirects
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/app";

  return <LoginForm nextPath={nextPath} />;
}



