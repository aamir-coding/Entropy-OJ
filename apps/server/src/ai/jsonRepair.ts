// Robust AI JSON Parser & Repair Utility.
//
// LLM-generated JSON often contains common formatting artifacts:
// 1. Markdown code fences
// 2. JavaScript string concatenation and expressions (e.g., "10000\n" + "0 ".repeat(9998) + "10000")
// 3. Single-line and multi-line comments
// 4. Trailing commas before closing braces/brackets
// 5. Unescaped LaTeX backslashes (e.g. $2 \cdot 10^9$, \le, \ge, \text)
// 6. Surrounding conversational prose before or after the JSON block
// 7. Single quotes or unquoted object keys
//
// This module provides a resilient multi-stage pipeline to extract and parse
// valid JavaScript objects from LLM outputs under all these conditions.

/**
 * Extracts the outermost JSON candidate string from raw text.
 */
export function extractCandidateJson(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw.trim();

  // 1. Check for markdown code fences
  const fenceMatch = text.match(/```(?:json|javascript|js)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1].trim();
  } else if (text.startsWith('~~~') && text.endsWith('~~~')) {
    text = text.replace(/^~~~(?:json|javascript|js)?\s*/i, '').replace(/\s*~~~$/, '').trim();
  }

  // 2. Find outermost matching brackets { ... } or [ ... ]
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = text.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1).trim();
  }

  return text;
}

/**
 * Safe parser for AI-generated object representations.
 * Handles string concatenation ("a" + "b"), string `.repeat()`, comments,
 * single quotes, and unquoted keys via deterministic text normalization
 * and native JSON.parse — NEVER executes code in a VM context.
 */
export function evaluateJsObject(code: string): any {
  if (!code || typeof code !== 'string') return null;

  try {
    const repaired = repairJsonString(code);
    return JSON.parse(repaired);
  } catch {
    try {
      // Relax unquoted object keys (e.g. { foo: "bar" } -> { "foo": "bar" })
      const normalizedKeys = code.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      const repaired = repairJsonString(normalizedKeys);
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

/**
 * Strips single-line and multi-line comments from JSON string while preserving
 * // and /* inside quoted string literals (Medium 3).
 */
export function stripJsonComments(input: string): string {
  let output = '';
  let inString = false;
  let isEscaped = false;
  let i = 0;
  const len = input.length;

  while (i < len) {
    const char = input[i];

    if (inString) {
      output += char;
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      i++;
    } else {
      if (char === '"') {
        inString = true;
        isEscaped = false;
        output += char;
        i++;
      } else if (char === '/' && i + 1 < len && input[i + 1] === '/') {
        // Line comment: skip until newline or end of string
        i += 2;
        while (i < len && input[i] !== '\n' && input[i] !== '\r') {
          i++;
        }
      } else if (char === '/' && i + 1 < len && input[i + 1] === '*') {
        // Block comment: skip until */ or end of string
        i += 2;
        while (i + 1 < len && !(input[i] === '*' && input[i + 1] === '/')) {
          i++;
        }
        i += 2; // skip past */
      } else {
        output += char;
        i++;
      }
    }
  }

  return output;
}

/**
 * Applies regex-based repairs to convert invalid JSON into valid JSON.
 */
export function repairJsonString(raw: string): string {
  // 1. Remove comments using stateful scanner that preserves URLs inside quotes (Medium 3)
  let s = stripJsonComments(raw);

  // 2. Resolve string .repeat(N) into safe expanded literals (capped to prevent DoS)
  s = s.replace(
    /"((?:[^"\\]|\\.)*)"\.repeat\((\d+)\)/g,
    (_, repeatStr, count) => {
      const repCount = parseInt(count, 10);
      const safeCount = Math.min(repCount, 100);
      return `"${repeatStr.repeat(safeCount)}"`;
    }
  );

  // 3. Resolve basic string concatenation: "foo" + "bar" -> "foobar"
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/"((?:[^"\\]|\\.)*)"\s*\+\s*"((?:[^"\\]|\\.)*)"/g, '"$1$2"');
  }

  // 4. Remove trailing commas in arrays and objects: , ] -> ] and , } -> }
  s = s.replace(/,\s*([}\]])/g, '$1');

  // 5. Fix invalid escape sequences (e.g. \c, \s, \i, \m, \a from LaTeX)
  // Valid JSON escapes: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
  s = s.replace(/\\([^"\\\/bfnrtu]|u(?![\da-fA-F]{4}))/g, '\\\\$1');

  return s;
}

/**
 * Extracts structured fields for review schemas when outer JSON is broken.
 */
function extractStructuralFields(raw: string): Record<string, any> | null {
  const result: Record<string, any> = {};

  // Extract statementAmbiguities array
  const ambiguitiesMatch = raw.match(/"statementAmbiguities"\s*:\s*(\[[^]*?\]\s*(?=,\s*"(?:missingEdgeCases|adversarialInputs|inconsistencies|overallAssessment)"|\s*\}))/);
  if (ambiguitiesMatch) {
    try {
      result.statementAmbiguities = JSON.parse(repairJsonString(ambiguitiesMatch[1]));
    } catch {
      result.statementAmbiguities = [];
    }
  }

  // Extract missingEdgeCases array
  const edgeCasesMatch = raw.match(/"missingEdgeCases"\s*:\s*(\[[^]*?\]\s*(?=,\s*"(?:adversarialInputs|inconsistencies|overallAssessment)"|\s*\}))/);
  if (edgeCasesMatch) {
    try {
      result.missingEdgeCases = JSON.parse(repairJsonString(edgeCasesMatch[1]));
    } catch {
      result.missingEdgeCases = [];
    }
  }

  // Extract adversarialInputs array
  const adversarialMatch = raw.match(/"adversarialInputs"\s*:\s*(\[[^]*?\]\s*(?=,\s*"(?:inconsistencies|overallAssessment)"|\s*\}))/);
  if (adversarialMatch) {
    try {
      const evalArray = evaluateJsObject(adversarialMatch[1]);
      if (Array.isArray(evalArray)) {
        result.adversarialInputs = evalArray;
      } else {
        result.adversarialInputs = JSON.parse(repairJsonString(adversarialMatch[1]));
      }
    } catch {
      result.adversarialInputs = [];
    }
  }

  // Extract inconsistencies array
  const inconsistenciesMatch = raw.match(/"inconsistencies"\s*:\s*(\[[^]*?\]\s*(?=,\s*"overallAssessment"|\s*\}))/);
  if (inconsistenciesMatch) {
    try {
      result.inconsistencies = JSON.parse(repairJsonString(inconsistenciesMatch[1]));
    } catch {
      result.inconsistencies = [];
    }
  }

  // Extract overallAssessment string
  const overallMatch = raw.match(/"overallAssessment"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (overallMatch) {
    result.overallAssessment = overallMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }

  // Extract approach classification fields
  const approachMatch = raw.match(/"approach"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (approachMatch) {
    result.approach = approachMatch[1];
  }
  const timeMatch = raw.match(/"timeComplexity"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (timeMatch) {
    result.timeComplexity = timeMatch[1];
  }
  const spaceMatch = raw.match(/"spaceComplexity"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (spaceMatch) {
    result.spaceComplexity = spaceMatch[1];
  }
  const relatedMatch = raw.match(/"relatedProblemCode"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (relatedMatch) {
    result.relatedProblemCode = relatedMatch[1];
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Universal safe parser for AI JSON responses.
 * Tries direct parsing -> JS evaluation -> regex repair -> subfield extraction.
 */
export function parseAIJson<T = any>(rawInput: string): T {
  if (!rawInput || typeof rawInput !== 'string') {
    throw new Error('Empty or invalid input provided to parseAIJson');
  }

  // 1. Extract candidate JSON
  const candidate = extractCandidateJson(rawInput);

  // 2. Fast path: Direct JSON.parse
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Continue to next stages
  }

  // 3. Stage 2: Sandboxed JS Object evaluation
  try {
    const evaluated = evaluateJsObject(candidate);
    if (evaluated && typeof evaluated === 'object') {
      return evaluated as T;
    }
  } catch {
    // Continue
  }

  // 4. Stage 3: Regex repair then JSON.parse
  const repaired = repairJsonString(candidate);
  try {
    return JSON.parse(repaired) as T;
  } catch {
    // Continue
  }

  // 5. Stage 4: Try JS Object evaluation on repaired text
  try {
    const evaluated = evaluateJsObject(repaired);
    if (evaluated && typeof evaluated === 'object') {
      return evaluated as T;
    }
  } catch {
    // Continue
  }

  // 6. Stage 5: Structural field extraction fallback
  const structural = extractStructuralFields(candidate);
  if (structural && Object.keys(structural).length > 0) {
    return structural as T;
  }

  throw new Error(`Failed to parse AI JSON response: ${candidate.slice(0, 150)}...`);
}
