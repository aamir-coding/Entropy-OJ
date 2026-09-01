process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseAIJson, extractCandidateJson, repairJsonString, evaluateJsObject } from '../ai/jsonRepair';

describe('AI JSON Repair & Fault-Tolerant Parser Tests', () => {
  it('should parse clean standard JSON correctly', () => {
    const json = JSON.stringify({
      statementAmbiguities: [{ issue: 'Test issue', suggestion: 'Test suggestion' }],
      missingEdgeCases: [],
      adversarialInputs: [],
      inconsistencies: [],
      overallAssessment: 'Looks good.',
    });

    const parsed = parseAIJson(json);
    assert.strictEqual(parsed.statementAmbiguities.length, 1);
    assert.strictEqual(parsed.statementAmbiguities[0].issue, 'Test issue');
    assert.strictEqual(parsed.overallAssessment, 'Looks good.');
  });

  it('should parse markdown fenced JSON with surrounding conversational commentary', () => {
    const raw = `Here is the comprehensive audit of the problem:

\`\`\`json
{
  "statementAmbiguities": [],
  "missingEdgeCases": [{ "description": "Empty input", "suggestedInput": "", "expectedBehavior": "0" }],
  "adversarialInputs": [],
  "inconsistencies": [],
  "overallAssessment": "Ready for publication."
}
\`\`\`

Hope this helps review the problem package!`;

    const parsed = parseAIJson(raw);
    assert.strictEqual(parsed.missingEdgeCases.length, 1);
    assert.strictEqual(parsed.missingEdgeCases[0].description, 'Empty input');
    assert.strictEqual(parsed.overallAssessment, 'Ready for publication.');
  });

  it('should parse the exact Trapping Rain Water adversarial string concatenation failure payload', () => {
    const raw = `{
  "statementAmbiguities": [
    {
      "issue": "Integer overflow boundary is close to 32-bit signed integer limits ($2 \\cdot 10^9$ vs $2.14 \\cdot 10^9$), but the statement does not explicitly state whether 64-bit integers are required across all programming languages.",
      "suggestion": "Add a note or mandate using 64-bit integers (e.g., \`long long\` in C++) to prevent silent precision/overflow issues."
    }
  ],
  "missingEdgeCases": [
    {
      "description": "Minimal input size boundary N = 1",
      "suggestedInput": "1\\n100",
      "expectedBehavior": "0"
    },
    {
      "description": "Minimal input size boundary N = 2",
      "suggestedInput": "2\\n10 20",
      "expectedBehavior": "0"
    },
    {
      "description": "All bars of identical height",
      "suggestedInput": "5\\n4 4 4 4 4",
      "expectedBehavior": "0"
    }
  ],
  "adversarialInputs": [
    {
      "input": "20000\\n100000 " + "0 ".repeat(19998) + "100000",
      "rationale": "Maximized constraints test case ($N=20000$, max height $10^5$) producing an output of $1,999,800,000$ to check for integer overflow and $O(N)$ efficiency."
    }
  ],
  "inconsistencies": [],
  "overallAssessment": "The problem statement and reference solution are correct and follow the standard Trapping Rain Water problem formulation. However, the test suite is severely under-populated with only 6 total test cases, lacking minimal boundary cases (N=1, N=2), max constraint stress tests, and uniform height arrays. Expanding the test suite with boundary and maximum capacity adversarial test cases is strongly recommended before publication."
}`;

    const parsed = parseAIJson(raw);
    assert.strictEqual(parsed.statementAmbiguities.length, 1);
    assert.strictEqual(parsed.missingEdgeCases.length, 3);
    assert.strictEqual(parsed.adversarialInputs.length, 1);
    assert.ok(parsed.adversarialInputs[0].input.includes('20000'));
    assert.ok(parsed.overallAssessment.includes('Trapping Rain Water'));
  });

  it('should repair trailing commas and JS single-line / multi-line comments', () => {
    const raw = `{
      // List of ambiguities
      "statementAmbiguities": [
        { "issue": "Ambiguity 1", "suggestion": "Fix 1", },
      ],
      /* Missing edge cases */
      "missingEdgeCases": [],
      "adversarialInputs": [],
      "inconsistencies": [],
      "overallAssessment": "Assessment text",
    }`;

    const parsed = parseAIJson(raw);
    assert.strictEqual(parsed.statementAmbiguities.length, 1);
    assert.strictEqual(parsed.overallAssessment, 'Assessment text');
  });

  it('should repair unescaped LaTeX backslashes without crashing', () => {
    const raw = `{
      "statementAmbiguities": [
        { "issue": "Constraint says $N \\le 10^5$ and $A[i] \\ge -10^9$ with \\cdot multiplier", "suggestion": "Use \\text{int64}" }
      ],
      "missingEdgeCases": [],
      "adversarialInputs": [],
      "inconsistencies": [],
      "overallAssessment": "Good."
    }`;

    const parsed = parseAIJson(raw);
    assert.strictEqual(parsed.statementAmbiguities.length, 1);
    assert.ok(parsed.statementAmbiguities[0].issue.includes('10^5'));
  });

  it('should parse approach classification JSON with relaxed formatting', () => {
    const raw = `\`\`\`json
    {
      "approach": "Monotonic Stack",
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(N)",
      "relatedProblemCode": "largest-rectangle-in-histogram",
    }
    \`\`\``;

    const parsed = parseAIJson(raw);
    assert.strictEqual(parsed.approach, 'Monotonic Stack');
    assert.strictEqual(parsed.timeComplexity, 'O(N)');
    assert.strictEqual(parsed.spaceComplexity, 'O(N)');
    assert.strictEqual(parsed.relatedProblemCode, 'largest-rectangle-in-histogram');
  });
});
