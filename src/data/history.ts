import rawHistory from "./history.json";
import rawIndex from "./research-index.json";

export type VerificationStatus = "verified" | "corroborated";
export type ImpactStatus = "contextual" | "documented";
export type EvidenceStatus = "documented-case" | "contextual-lead" | "research-lead";

export type HistorySource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: string;
  language: string;
  note?: string;
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

export type Microhistory = {
  id: string;
  period: string;
  beYear: string;
  ceYear: string;
  title: string;
  location: string[];
  groups: string[];
  everydayDimensions: string[];
  fact: string;
  livedExperience: string;
  evidenceStatus: EvidenceStatus;
  sourceIds: string[];
  linkedEventIds: string[];
  missingVoices: string[];
  openQuestion: string;
};

export const history = rawHistory as {
  meta: typeof rawHistory.meta;
  sources: HistorySource[];
  worldContexts: WorldContext[];
  events: HistoryEvent[];
  microhistories: Microhistory[];
};

export const sources = history.sources;
export const worldContexts = history.worldContexts;
export const events = history.events;
export const microhistories = history.microhistories;

export const sourceById = new Map(sources.map((source) => [source.id, source]));
export const worldContextById = new Map(worldContexts.map((context) => [context.id, context]));
export const eventById = new Map(events.map((event) => [event.id, event]));
export const microhistoryById = new Map(microhistories.map((record) => [record.id, record]));

/** Derived by the canonical research index so the public warning cannot drift from the data audit. */
export const singleSourceSensitiveEventIds = new Set<string>(rawIndex.coverage.singleSourceSensitiveEvents);
