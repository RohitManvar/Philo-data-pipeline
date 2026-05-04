/** Strip Wikipedia citation brackets like [1], [a], [nb 2], etc. */
export function cleanText(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\[[^\]]{0,10}\]/g, "")           // [1], [a], [nb 2], etc.
    .replace(/\(\s*\d{4}-\d{2}-\d{2}\s*\)/g, "") // (1895-05-11)
    // Strip non-Latin scripts (Hebrew, Arabic, CJK, Devanagari, etc.)
    .replace(/[֐-׿؀-ۿऀ-ॿ一-鿿぀-ヿ가-힯]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract a clean year or short date from a raw Wikipedia birth/death string. */
export function cleanDate(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw
    .replace(/\(\s*\d{4}-\d{2}-\d{2}\s*\)/g, "")
    .replace(/\[[^\]]{0,10}\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Take text before the first newline or location separator
  s = s.split(/\n/)[0].trim();

  // Try to match a full date like "11 May 1895" or "May 11, 1895"
  const full = s.match(/\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}/);
  if (full) return full[0];

  // Fall back to a 4-digit year
  const year = s.match(/\d{4}/);
  if (year) return year[0];

  return s.slice(0, 30);
}

/** Force image URL to HTTPS to avoid mixed-content blocks on Vercel. */
export function secureUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

/** Return true if a school name is suitable to display as a filter option. */
export function isCleanSchool(school: string): boolean {
  if (!school) return false;
  if (school.length > 40) return false;
  // Reject anything containing digits (dates, centuries like "18th-century")
  if (/\d/.test(school)) return false;
  // Reject known noisy patterns
  if (/century|BCE|B\.C|C\.E|\bAD\b|\bBC\b|Kali Yuga|millennium|venerate|denomin|philosophy$/i.test(school)) return false;
  // Reject entries with commas, parentheses, or quotes
  if (/[,()"]/.test(school)) return false;
  // Reject single-word lowercase entries (usually bad scrapes)
  if (school === school.toLowerCase() && !school.includes(" ")) return false;
  // Reject non-Latin scripts
  if (/[֐-׿؀-ۿऀ-ॿ一-鿿]+/.test(school)) return false;
  return true;
}
