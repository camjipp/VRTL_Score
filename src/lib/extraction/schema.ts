import { z } from "zod";

export const extractionSchema = z.object({
  client_mentioned: z.boolean(),
  client_position: z.enum(["top", "middle", "bottom", "not_mentioned"]),
  recommendation_strength: z.enum(["strong", "medium", "weak", "none"]),
  competitors_mentioned: z.array(z.string()),
  has_sources_or_citations: z.boolean(),
  has_specific_features: z.boolean(),
  evidence_snippet: z.string().max(200)
});

export type Extraction = z.infer<typeof extractionSchema>;


