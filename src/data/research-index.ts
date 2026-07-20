import rawIndex from "./research-index.json";

export type TaxonomyEntry = { id: string; label: string; question?: string; publicationUse?: string };

export type Pattern = {
  id: string;
  status: string;
  title: string;
  statement: string;
  evidenceIds: string[];
  counterEvidenceNeeded: string;
};

export type MicrohistoryFacet = {
  period: string;
  macroThemeIds: string[];
  mechanismIds: string[];
  regionIds: string[];
  groupCategoryIds: string[];
  evidenceStatus: string;
};

export type Coverage = {
  periodMacroTheme: Record<string, Record<string, number>>;
  sourceFamilyCounts: Record<string, number>;
  eventToMicrohistories: Record<string, string[]>;
  eventsWithoutMicrohistory: string[];
  microhistoriesWithoutEvent: string[];
  singleSourceSensitiveEvents: string[];
};

export const researchIndex = rawIndex as {
  meta: typeof rawIndex.meta;
  taxonomies: {
    macroThemes: TaxonomyEntry[];
    mechanisms: TaxonomyEntry[];
    regions: TaxonomyEntry[];
    groupCategories: TaxonomyEntry[];
    evidenceStatuses: TaxonomyEntry[];
  };
  microhistoryFacets: Record<string, MicrohistoryFacet>;
  indexes: Record<string, Record<string, string[]>>;
  coverage: Coverage;
  patterns: Pattern[];
};

export const patterns = researchIndex.patterns;
export const coverage = researchIndex.coverage;
export const taxonomies = researchIndex.taxonomies;
export const microhistoryFacets = researchIndex.microhistoryFacets;

export const macroThemeLabel = new Map(taxonomies.macroThemes.map((entry) => [entry.id, entry.label]));
