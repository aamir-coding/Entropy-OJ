/**
 * Normalizes output strings according to Decision R2:
 * 1. Converts Windows (\r\n) line breaks to Unix (\n) line breaks.
 * 2. Trims trailing whitespace from each line.
 * 3. Removes trailing empty lines at the end of the file.
 * 4. Strictly preserves internal whitespace within lines.
 * 5. Caps excessively large strings (up to 1MB) for line display while preventing false-positive matches.
 */
export const MAX_NORMALIZE_LENGTH = 1024 * 1024; // 1M characters safety cap
export const MAX_NORMALIZE_LENGTH_CHARS = MAX_NORMALIZE_LENGTH;
/** @deprecated Use MAX_NORMALIZE_LENGTH or MAX_NORMALIZE_LENGTH_CHARS instead. Note: JavaScript string length counts UTF-16 code units, not raw bytes. */
export const MAX_NORMALIZE_SIZE_BYTES = MAX_NORMALIZE_LENGTH;

export interface NormalizedLinesResult {
  lines: string[];
  truncated: boolean;
  originalLength: number;
}

/**
 * Normalizes an output string into an array of trimmed lines in a single efficient pass:
 * - Unifies \r\n and \r into \n
 * - Trims trailing whitespace on each line
 * - Removes trailing empty lines at EOF
 * - Preserves internal and leading indentation strictly
 */
export function normalizeToLines(str: string, maxChars = MAX_NORMALIZE_LENGTH): NormalizedLinesResult {
  if (!str) {
    return { lines: [], truncated: false, originalLength: 0 };
  }

  const originalLength = str.length;
  const truncated = originalLength > maxChars;
  const targetStr = truncated ? str.slice(0, maxChars) : str;

  const rawLines = targetStr.split(/\r\n|\r|\n/);
  const lines: string[] = new Array(rawLines.length);

  for (let i = 0; i < rawLines.length; i++) {
    lines[i] = rawLines[i].trimEnd();
  }

  // Pop trailing empty lines from EOF
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return { lines, truncated, originalLength };
}

export function normalizeOutput(str: string): string {
  const { lines } = normalizeToLines(str);
  return lines.join('\n');
}

export interface DiffResult {
  isMatch: boolean;
  normalizedActual: string;
  normalizedExpected: string;
  diffLineIndex?: number;
  expectedLine?: string;
  actualLine?: string;
  truncated?: boolean;
}

/**
 * Compares user execution output against expected test case output.
 */
export function diffOutput(actual: string, expected: string): DiffResult {
  const normActualData = normalizeToLines(actual);
  const normExpectedData = normalizeToLines(expected);

  const actualLines = normActualData.lines;
  const expectedLines = normExpectedData.lines;

  const normalizedActual = actualLines.join('\n');
  const normalizedExpected = expectedLines.join('\n');

  const wasTruncated = normActualData.truncated || normExpectedData.truncated;

  // Exact match on untruncated normalized output
  if (!wasTruncated && normalizedActual === normalizedExpected) {
    return {
      isMatch: true,
      normalizedActual,
      normalizedExpected,
      truncated: false,
    };
  }

  // If one or both exceeded MAX_NORMALIZE_LENGTH, check whether they truly match in full
  if (wasTruncated) {
    if (normActualData.originalLength !== normExpectedData.originalLength || actual !== expected) {
      // Find first line divergence within the available lines, or flag divergence
      const maxLines = Math.max(actualLines.length, expectedLines.length);
      for (let i = 0; i < maxLines; i++) {
        const hasAct = i < actualLines.length;
        const hasExp = i < expectedLines.length;
        if (!hasAct || !hasExp || actualLines[i] !== expectedLines[i]) {
          return {
            isMatch: false,
            normalizedActual,
            normalizedExpected,
            diffLineIndex: i + 1,
            actualLine: hasAct ? actualLines[i] : undefined,
            expectedLine: hasExp ? expectedLines[i] : undefined,
            truncated: true,
          };
        }
      }

      return {
        isMatch: false,
        normalizedActual,
        normalizedExpected,
        diffLineIndex: maxLines + 1,
        actualLine: '[Output exceeds 1MB limit and diverges from expected output]',
        expectedLine: '[Full expected output diverges beyond display cap]',
        truncated: true,
      };
    }

    // Both are truly identical throughout their full length
    return {
      isMatch: true,
      normalizedActual,
      normalizedExpected,
      truncated: true,
    };
  }

  // Line-by-line comparison with explicit bound checks (no in-band '<EOF>')
  const maxLines = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < maxLines; i++) {
    const hasAct = i < actualLines.length;
    const hasExp = i < expectedLines.length;
    const act = hasAct ? actualLines[i] : undefined;
    const exp = hasExp ? expectedLines[i] : undefined;

    if (!hasAct || !hasExp || act !== exp) {
      return {
        isMatch: false,
        normalizedActual,
        normalizedExpected,
        diffLineIndex: i + 1, // 1-indexed line
        actualLine: act,
        expectedLine: exp,
        truncated: false,
      };
    }
  }

  return {
    isMatch: false,
    normalizedActual,
    normalizedExpected,
    truncated: false,
  };
}
