import rawHistory from "./history.json";

export type VerificationStatus = "verified" | "corroborated";
export type ImpactStatus = "contextual" | "documented";

export type HistorySource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: string;
  language: string;
};

export type WorldContext = {
  id: string;
  beYear: string;
  ceYear: string;
  title: string;
  channel: string;
  relation: "direct" | "indirect" | "contextual";
  summary: string;
  sourceIds: string[];
};

export type HistoryEvent = {
  id: string;
  period: string;
  beYear: string;
  ceYear: string;
  title: string;
  summary: string;
  peopleImpact: string;
  impactStatus: ImpactStatus;
  themes: string[];
  locations: string[];
  sourceIds: string[];
  worldContextIds: string[];
  verification: VerificationStatus;
  openQuestion: string;
};

export const history = rawHistory as {
  meta: typeof rawHistory.meta;
  sources: HistorySource[];
  worldContexts: WorldContext[];
  events: HistoryEvent[];
};

export const sources = history.sources;
export const worldContexts = history.worldContexts;
export const events = history.events;

export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const worldContextById = new Map(worldContexts.map((context) => [context.id, context]));

