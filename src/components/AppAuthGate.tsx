"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BRAND_LOCKUP_IMAGE_HEIGHT,
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_IMAGE_WIDTH,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";
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
          src={BRAND_LOCKUP_SRC}
          alt="VRTL Score"
          width={BRAND_LOCKUP_IMAGE_WIDTH}
          height={BRAND_LOCKUP_IMAGE_HEIGHT}
          className="mb-6 h-16 w-auto max-w-[min(280px,85vw)] animate-pulse bg-transparent object-contain object-center"
          priority
          sizes="(max-width: 768px) 85vw, 280px"
          unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
        />
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
      </div>
    );
  }

  return <>{children}</>;
}


