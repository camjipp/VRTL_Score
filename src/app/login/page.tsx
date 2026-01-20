import { LoginForm } from "@/components/LoginForm";
import { Card } from "@/components/ui/Card";

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

  return (
    <main className="bg-bg">
      <div className="container-xl py-14">
        <Card className="mx-auto max-w-lg p-6 shadow-none">
          <LoginForm nextPath={nextPath} />
        </Card>
      </div>
    </main>
  );
}



