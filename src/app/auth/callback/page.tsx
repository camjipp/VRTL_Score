import { Suspense } from "react";

import { AuthCallbackContent } from "./AuthCallbackContent";

function CallbackFallback() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#05070A" }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]"
      />
      <p className="mt-4 text-sm text-[#8B98A5]">Completing sign-in…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
