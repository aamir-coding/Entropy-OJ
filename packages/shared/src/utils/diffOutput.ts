/**
 * Normalizes output strings according to Decision R2:
 * 1. Converts Windows (\r\n) line breaks to Unix (\n) line breaks.
 * 2. Trims trailing whitespace from each line.
 * 3. Removes trailing empty lines at the end of the file.
 * 4. Strictly preserves internal whitespace within lines.
 * 5. Caps excessively large strings (up to 1MB) to prevent heap exhaustion.
 */
export const MAX_NORMALIZE_LENGTH = 1024 * 1024; // 1M characters safety cap
export const MAX_NORMALIZE_SIZE_BYTES = MAX_NORMALIZE_LENGTH; // Backward compatibility alias

export function normalizeOutput(str: string): string {
  if (!str) return '';

  // Prevent memory explosion on huge strings
  const boundedStr = str.length > MAX_NORMALIZE_LENGTH ? str.slice(0, MAX_NORMALIZE_LENGTH) : str;

  return boundedStr
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n+$/, ''); // Remove trailing newlines at EOF
}

export interface DiffResult {
  isMatch: boolean;
  normalizedActual: string;
  normalizedExpected: string;
  diffLineIndex?: number;
  expectedLine?: string;
  actualLine?: string;
}

/**
 * Compares user execution output against expected test case output.
 */
export function diffOutput(actual: string, expected: string): DiffResult {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) {
    return {
      isMatch: true,
      normalizedActual: normActual,
      normalizedExpected: normExpected,
    };
  }

  const actualLines = normActual.length > 0 ? normActual.split('\n') : [];
  const expectedLines = normExpected.length > 0 ? normExpected.split('\n') : [];

  const maxLines = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < maxLines; i++) {
    const act = actualLines[i] ?? '<EOF>';
    const exp = expectedLines[i] ?? '<EOF>';
    if (act !== exp) {
      return {
        isMatch: false,
        normalizedActual: normActual,
        normalizedExpected: normExpected,
        diffLineIndex: i + 1, // 1-indexed line
        actualLine: act,
        expectedLine: exp,
      };
    }
  }

  return {
    isMatch: false,
    normalizedActual: normActual,
    normalizedExpected: normExpected,
  };
}
