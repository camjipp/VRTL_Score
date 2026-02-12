/**
 * Fetch with timeout and optional retry for auth-critical requests.
 * "Failed to fetch" often means cold start or transient network issues.
 */
const DEFAULT_TIMEOUT = 25000; // 25s to handle serverless cold starts
const RETRY_DELAY = 2000;

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT,
  retries = 1
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      const isLastAttempt = attempt === retries;
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork = err instanceof TypeError || (err instanceof Error && err.message === "Failed to fetch");

      if (isLastAttempt) throw err;

      // Retry on timeout or network failure
      if ((isAbort || isNetwork) && retries > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      } else {
        throw err;
      }
    }
  }

  throw new Error("Request failed");
}
