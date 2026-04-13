import Image from "next/image";

import { BRAND_LOCKUP_INTRINSIC_SIZE, BRAND_LOCKUP_SRC } from "@/lib/brand/logo";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <Image
        src={BRAND_LOCKUP_SRC}
        alt="VRTL Score"
        width={BRAND_LOCKUP_INTRINSIC_SIZE}
        height={BRAND_LOCKUP_INTRINSIC_SIZE}
        className="mb-6 h-16 w-[min(268px,58vw)] animate-pulse object-cover object-[50%_45%]"
        priority
        sizes="(max-width: 768px) 58vw, 268px"
      />
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
    </div>
  );
}

