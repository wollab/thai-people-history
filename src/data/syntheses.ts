import rawSyntheses from "./syntheses.json";

export type SynthesisStory = {
  id: string;
  title: string;
  deck: string;
  periodRange: string;
  patternIds: string[];
  evidenceIds: string[];
  sourceIds: string[];
  claim: string;
  limits: string;
  status: "reader-draft";
};

export const synthesisMeta = rawSyntheses.meta;
export const synthesisStories = (rawSyntheses.stories as SynthesisStory[]).map((story) => ({
  ...story,
  slug: story.id.replace(/^syn-/, ""),
}));
export const synthesisBySlug = new Map(synthesisStories.map((story) => [story.slug, story]));
