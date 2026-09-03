import mongoose from 'mongoose';
import { IApproachClassification, IClassifyJobPayload } from '@anti-oj/shared';
import { env } from '../../config/env';
import { Solution } from '../../models/Solution';
import { getProvider, callWithFallback, AIProvider, ChatMessage } from '../providers';
import { parseAIJson } from '../jsonRepair';

/**
 * Algorithmic pattern heuristics analyzer.
 * Guarantees zero-downtime, deterministic classification if external LLM APIs are offline or rate limited.
 */
function getHeuristicClassification(problemName: string, code: string): IApproachClassification {
  const codeLower = code.toLowerCase();
  const nameLower = problemName.toLowerCase();

  let approach = 'Direct Simulation / Iterative Search';
  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';

  if (
    nameLower.includes('two sum') ||
    codeLower.includes('unordered_map') ||
    codeLower.includes('seen') ||
    codeLower.includes('set(') ||
    codeLower.includes('hash')
  ) {
    approach = 'Hash Table / Frequency Map';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  } else if (
    nameLower.includes('parentheses') ||
    codeLower.includes('stack') ||
    (codeLower.includes('.push(') && codeLower.includes('.pop('))
  ) {
    approach = 'Stack / Monotonic LIFO';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  } else if (
    nameLower.includes('binary search') ||
    (codeLower.includes('mid') && codeLower.includes('low') && codeLower.includes('high'))
  ) {
    approach = 'Binary Search / Divide and Conquer';
    timeComplexity = 'O(log N)';
    spaceComplexity = 'O(1)';
  } else if (
    nameLower.includes('window') ||
    codeLower.includes('deque') ||
    codeLower.includes('sliding')
  ) {
    approach = 'Sliding Window / Monotonic Deque';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(K)';
  } else if (
    nameLower.includes('climb') ||
    nameLower.includes('coin') ||
    nameLower.includes('edit') ||
    nameLower.includes('increasing') ||
    codeLower.includes('dp[') ||
    codeLower.includes('dp =')
  ) {
    approach = 'Dynamic Programming';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  } else if (
    nameLower.includes('island') ||
    nameLower.includes('course') ||
    nameLower.includes('ladder') ||
    codeLower.includes('queue') ||
    codeLower.includes('bfs') ||
    codeLower.includes('dfs')
  ) {
    approach = 'Graph Traversal (BFS / DFS)';
    timeComplexity = 'O(V + E)';
    spaceComplexity = 'O(V)';
  } else if (
    nameLower.includes('water') ||
    nameLower.includes('reverse') ||
    nameLower.includes('merge') ||
    (codeLower.includes('left') && codeLower.includes('right'))
  ) {
    approach = 'Two Pointers';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(1)';
  } else if (
    nameLower.includes('kth') ||
    nameLower.includes('k sorted') ||
    codeLower.includes('priority_queue') ||
    codeLower.includes('heapq')
  ) {
    approach = 'Min-Heap / Priority Queue';
    timeComplexity = 'O(N log K)';
    spaceComplexity = 'O(K)';
  } else if (nameLower.includes('queen') || codeLower.includes('backtrack')) {
    approach = 'Backtracking / State-Space Search';
    timeComplexity = 'O(N!)';
    spaceComplexity = 'O(N)';
  }

  return { approach, timeComplexity, spaceComplexity };
}

export class ClassifyService {
  async classifySubmission(
    payload: IClassifyJobPayload,
    customProvider?: AIProvider
  ): Promise<IApproachClassification | null> {
    // 1. Check Feature Flag
    if (!env.FEATURE_AI_CLASSIFY) {
      return getHeuristicClassification(payload.problemName, payload.code);
    }

    const systemPrompt = `You are an expert algorithm analysis engine for a competitive programming platform.
Your task is to analyze an Accepted solution and determine:
1. The primary algorithmic pattern/paradigm used (e.g. "Two Pointers", "Sliding Window", "Monotonic Stack", "Dynamic Programming", "Breadth-First Search", "Hash Map / Frequency Counting", "Binary Search").
2. The Big-O Time Complexity (e.g. "O(N)", "O(N log N)", "O(N * M)").
3. The Auxiliary Space Complexity (e.g. "O(1)", "O(N)", "O(K)").

You MUST return ONLY a JSON object with this exact schema:
{
  "approach": "Primary algorithmic pattern name",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)"
}

CRITICAL RULES:
- Output ONLY valid JSON matching the schema.
- Do NOT output markdown fences, thoughts, or extra commentary.
- Be precise and concise.`;

    const userPrompt = `Problem Name: ${payload.problemName}
Problem Statement:
${payload.problemStatement}

Language: ${payload.language}
Accepted Code:
${payload.code}

Please classify the approach and complexity in JSON format.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    let classification: IApproachClassification | null = null;

    try {
      let content = '';
      if (customProvider) {
        const res = await customProvider.chatCompletion({
          model: '',
          messages,
          temperature: 0.1,
          maxTokens: 500,
          responseFormat: 'json',
        });
        content = res.content;
      } else {
        // Groq primary (ultra-low latency ~300ms) -> OpenRouter fallback
        const groq = getProvider('groq');
        const openrouter = getProvider('openrouter');
        const startTime = Date.now();
        console.log(`[ClassifyService] 🤖 Sending prompt to live AI Provider (Groq -> OpenRouter) for "${payload.problemName}"...`);
        const res = await callWithFallback([groq, openrouter], {
          model: '',
          messages,
          temperature: 0.1,
          maxTokens: 500,
          responseFormat: 'json',
        });
        const elapsed = Date.now() - startTime;
        console.log(`[ClassifyService] ⚡ Live AI (${res.provider}/${res.model}) responded in ${elapsed}ms`);
        content = res.content;
      }

      if (content && content.trim().length > 0) {
        const parsed = parseAIJson<IApproachClassification>(content);
        if (parsed.approach && parsed.timeComplexity) {
          classification = {
            approach: String(parsed.approach).trim(),
            timeComplexity: String(parsed.timeComplexity).trim(),
            spaceComplexity: String(parsed.spaceComplexity || 'O(1)').trim(),
            relatedProblemCode: parsed.relatedProblemCode ? String(parsed.relatedProblemCode).trim().toLowerCase() : undefined,
          };
        }
      }
    } catch (err: any) {
      console.warn(`[ClassifyService] AI Provider call failed for submission ${payload.submissionId}: ${err.message}.`);
    }

    // If a custom mock provider was explicitly supplied (e.g. in unit tests) and failed, return null
    if (customProvider && !classification) {
      return null;
    }

    // If AI generation failed in real production/dev execution, use robust algorithmic heuristic fallback
    if (!classification) {
      classification = getHeuristicClassification(payload.problemName, payload.code);
    }

    // Save directly to MongoDB Solution document if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(payload.submissionId)) {
      try {
        await Solution.findByIdAndUpdate(payload.submissionId, {
          $set: { classification },
        });
      } catch (dbErr: any) {
        console.warn('[ClassifyService] DB update failed:', dbErr.message);
      }
    }

    console.log(`[ClassifyService] Classified submission ${payload.submissionId} -> [${classification.approach}] ${classification.timeComplexity}`);
    return classification;
  }
}

export const classifyService = new ClassifyService();
