import rawIndicators from "./quality-indicators.json";

export type IndicatorDirection = "higher-better" | "lower-better" | "context-only";

export type IndicatorPoint = {
  beYear: number;
  ceYear: number;
  value: number;
  observationStatus: string | null;
  decimal: number;
};

export type QualityIndicator = {
  id: string;
  worldBankCode: string;
  labelTh: string;
  shortLabelTh: string;
  dimension: string;
  unitTh: string;
  direction: IndicatorDirection;
  decimals: number;
  definitionTh: string;
  interpretationNoteTh: string;
  eventThemes: string[];
  sourceTitle: string;
  sourceUrl: string;
  apiUrl: string;
  sourceNote: string;
  sourceOrganization: string;
  license: string;
  accessed: string;
  firstBeYear: number;
  lastBeYear: number;
  values: IndicatorPoint[];
};

export const qualityIndicatorData = rawIndicators as {
  meta: typeof rawIndicators.meta;
  dimensions: { id: string; labelTh: string }[];
  indicators: QualityIndicator[];
};

export const qualityIndicators = qualityIndicatorData.indicators;
