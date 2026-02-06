"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AppAuthGateProps = {
  children: React.ReactNode;
};

export function AppAuthGate({ children }: AppAuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname ?? "/app")}`);
        return;
      }
      if (!cancelled) setReady(true);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, supabase.auth]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <Image
          src="/brand/VRTL_Solo.png"
          alt="VRTL Score"
          width={160}
          height={56}
          className="mb-6 h-12 w-auto animate-pulse"
          priority
        />
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
      </div>
    );
  }

  return <>{children}</>;
}


