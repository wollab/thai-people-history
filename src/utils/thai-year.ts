export const BE_OFFSET = 543;

export function beFromCe(ce: number): number {
  return ce + BE_OFFSET;
}

export function ceRangeFromBeRange(beRange: string): string {
  return beRange
    .split("-")
    .map((part) => String(Number(part) - BE_OFFSET))
    .join("-");
}

/** Format a single already-paired พ.ศ./ค.ศ. value, e.g. formatBeCe("2460", "1917") -> "พ.ศ. 2460 (ค.ศ. 1917)" */
export function formatBeCe(be: string | number, ce: string | number): string {
  return `พ.ศ. ${be} (ค.ศ. ${ce})`;
}

/** Format a พ.ศ. range where only the range itself is known, e.g. formatBeRange("2460-2475") -> "พ.ศ. 2460-2475 (ค.ศ. 1917-1932)" */
export function formatBeRange(beRange: string): string {
  return `พ.ศ. ${beRange} (ค.ศ. ${ceRangeFromBeRange(beRange)})`;
}
