/**
 * Extract JSON from LLM response text.
 * Handles markdown code blocks (```json ... ```) which some models return.
 */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Try direct parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    // no-op
  }

  // Try to extract from ```json ... ``` or ``` ... ```
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock?.[1]) {
    try {
      return JSON.parse(jsonBlock[1].trim());
    } catch {
      // no-op
    }
  }

  // Try to find a JSON object in the text
  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // no-op
    }
  }

  return null;
}
