export enum ReasoningMode {
  MAP = "map_reasoning",
  REWRITE = "rewrite_reasoning",
  TEACH = "teach_thinking"
}

export enum NodeType {
  EMPIRICAL = "empirical",
  CAUSAL = "causal",
  NORMATIVE = "normative",
  EMOTIONAL = "emotional",
  ANECDOTAL = "anecdotal",
  UNDEFINED = "undefined"
}

export enum LinkStrength {
  SUPPORTED = "supported",
  WEAK = "weak",
  UNDEFINED = "undefined",
  CIRCULAR = "circular"
}

export interface Node {
  id: string;
  text: string;
  type: NodeType;
}

export interface Link {
  from: string;
  to: string;
  strength: LinkStrength;
}

export interface ReasoningMap {
  nodes: Node[];
  links: Link[];
}

export interface FragilePoint {
  node_id: string;
  why_fragile: string;
}

export interface AnalysisResponse {
  reasoning_map: ReasoningMap;
  fragile_points: FragilePoint[];
  missing_variables: string[];
  // Optional fields based on mode
  rewritten_reasoning?: string;
  changes_made?: string[];
  teaching_points?: string[];
}

// D3 simulation types
export interface SimulationNode extends Node {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimulationLink extends Link {
  source: SimulationNode | string;
  target: SimulationNode | string;
}