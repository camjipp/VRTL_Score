import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">VRTLScore</h1>
      <p className="mt-2 text-sm">
        v1 skeleton. Use the routes below to verify wiring.
      </p>
      <ul className="mt-4 list-disc pl-6 text-sm">
        <li>
          <Link className="underline" href="/login">
            /login
          </Link>
        </li>
        <li>
          <Link className="underline" href="/pricing">
            /pricing
          </Link>
        </li>
        <li>
          <Link className="underline" href="/app">
            /app
          </Link>
        </li>
      </ul>
    </main>
  );
}



