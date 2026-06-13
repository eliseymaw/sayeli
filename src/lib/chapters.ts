/**
 * The five acts of the dragon's life, expressed as normalized scroll ranges
 * over the full experience (0 = top, 1 = bottom). Both the 3D scene and the
 * HTML overlay derive their state from these boundaries, so the story stays
 * perfectly in sync.
 */

export type ChapterId =
  | "birth"
  | "awakening"
  | "journey"
  | "legacy"
  | "rebirth";

export interface Chapter {
  id: ChapterId;
  index: number;
  numeral: string;
  title: string;
  /** scroll offset where this chapter begins / ends */
  start: number;
  end: number;
}

/** Number of scroll "pages" (viewport heights) the experience spans. */
export const PAGES = 9;

export const CHAPTERS: Chapter[] = [
  { id: "birth", index: 0, numeral: "I", title: "Birth", start: 0.0, end: 0.16 },
  { id: "awakening", index: 1, numeral: "II", title: "Awakening", start: 0.16, end: 0.34 },
  { id: "journey", index: 2, numeral: "III", title: "Journey", start: 0.34, end: 0.66 },
  { id: "legacy", index: 3, numeral: "IV", title: "Legacy", start: 0.66, end: 0.84 },
  { id: "rebirth", index: 4, numeral: "V", title: "Rebirth", start: 0.84, end: 1.0 },
];

export const chapterAt = (offset: number): Chapter => {
  for (const c of CHAPTERS) {
    if (offset >= c.start && offset < c.end) return c;
  }
  return CHAPTERS[CHAPTERS.length - 1];
};
