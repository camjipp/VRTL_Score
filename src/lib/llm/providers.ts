export type Provider = "openai" | "anthropic" | "gemini";

function getAnthropicKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
}

export function getEnabledProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (getAnthropicKey()) providers.push("anthropic");
  if (process.env.GEMINI_API_KEY) providers.push("gemini");
  return providers;
}


