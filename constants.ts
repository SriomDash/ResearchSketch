import { NodeType, LinkStrength } from './types';

export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.EMPIRICAL]: "#3b82f6", // Blue
  [NodeType.CAUSAL]: "#8b5cf6", // Purple
  [NodeType.NORMATIVE]: "#10b981", // Emerald
  [NodeType.EMOTIONAL]: "#f43f5e", // Rose
  [NodeType.ANECDOTAL]: "#f59e0b", // Amber
  [NodeType.UNDEFINED]: "#64748b", // Slate
};

export const LINK_COLORS: Record<LinkStrength, string> = {
  [LinkStrength.SUPPORTED]: "#475569",
  [LinkStrength.WEAK]: "#dc2626", // Red dashed usually
  [LinkStrength.UNDEFINED]: "#94a3b8",
  [LinkStrength.CIRCULAR]: "#eab308",
};

export const SYSTEM_INSTRUCTION = `
You are ReasonSketch, an AI cognitive instrument. 
1. Operate on reasoning structure, not conclusions.
2. Decompose before explaining.
3. Reveal assumptions without judgment.
4. Input classification: Empirical, Causal, Normative, Emotional, Anecdotal, Undefined.
5. Link strengths: Supported, Weak, Undefined, Circular.
6. Identify fragile points where logic collapses if assumptions fail.
`;
