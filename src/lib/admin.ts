import "server-only";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = getAdminEmails();
  if (allow.length === 0) return false;
  return allow.includes(email.trim().toLowerCase());
}


