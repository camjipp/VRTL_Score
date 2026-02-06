import Image from "next/image";

export default function AppLoading() {
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

