import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <div className="text-center">
        {/* Big 404 */}
        <div className="text-[120px] font-bold leading-none tracking-tighter text-text/10 sm:text-[180px]">
          404
        </div>

        {/* Message */}
        <h1 className="-mt-6 text-2xl font-bold text-text sm:-mt-10 sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-text-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl"
          >
            Go to homepage
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium text-text-2 hover:text-text"
          >
            Go to dashboard →
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-16 flex items-center justify-center gap-2 text-sm text-text-3">
          <span>Lost?</span>
          <Link href="mailto:support@vrtlscore.com" className="text-text hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}

