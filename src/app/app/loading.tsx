import Image from "next/image";

import { BRAND_LOCKUP_SRC } from "@/lib/brand/logo";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <Image
        src={BRAND_LOCKUP_SRC}
        alt="VRTL Score"
        width={280}
        height={72}
        className="mb-6 h-12 w-auto max-w-[min(280px,85vw)] animate-pulse object-contain object-center"
        priority
      />
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
    </div>
  );
}

