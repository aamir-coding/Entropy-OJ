import mongoose from 'mongoose';
import { IApproachClassification, IClassifyJobPayload } from '@anti-oj/shared';
import { env } from '../../config/env';
import { Solution } from '../../models/Solution';
import { getProvider, AIProvider, ChatMessage, AIProviderError } from '../providers';
import { parseAIJson } from '../jsonRepair';

export class ClassifyService {
  async classifySubmission(
    payload: IClassifyJobPayload,
    customProvider?: AIProvider
  ): Promise<IApproachClassification | null> {
    // 1. Check Feature Flag
    if (env.FEATURE_AI_CLASSIFY === 'false') {
      return null;
    }

    const systemPrompt = `You are an expert algorithm analysis engine for a competitive programming platform.
Your task is to analyze an Accepted solution and determine:
1. The primary algorithmic pattern/paradigm used (e.g. "Two Pointers", "Sliding Window", "Monotonic Stack", "Dynamic Programming - Bottom Up", "BFS / Queue", "Hash Map Frequency Counting", "Binary Search on Answer").
2. The Big-O Time Complexity (e.g. "O(N)", "O(N log N)", "O(N * M)").
3. The Auxiliary Space Complexity (e.g. "O(1)", "O(N)", "O(K)").
4. (Optional) A problem code / slug for a harder, related problem on the same topic (e.g. "trapping-rain-water", "longest-unique-substring", "maximum-subarray", "valid-parentheses", "two-sum").

You MUST return a JSON object with this exact schema:
{
  "approach": "Primary algorithmic pattern name",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "relatedProblemCode": "problem-slug-or-empty"
}

CRITICAL RULES:
- Output ONLY valid JSON matching the schema.
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

    const provider = customProvider || getProvider('openrouter');

    try {
      const completion = await provider.chatCompletion({
        model: '',
        messages,
        temperature: 0.1,
        maxTokens: 500,
        responseFormat: 'json',
      });

      const parsed = parseAIJson<IApproachClassification>(completion.content);
      if (!parsed.approach || !parsed.timeComplexity) {
        throw new Error('Classification missing required fields');
      }

      const classification: IApproachClassification = {
        approach: String(parsed.approach).trim(),
        timeComplexity: String(parsed.timeComplexity).trim(),
        spaceComplexity: String(parsed.spaceComplexity || 'O(1)').trim(),
        relatedProblemCode: parsed.relatedProblemCode ? String(parsed.relatedProblemCode).trim().toLowerCase() : undefined,
      };

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
    } catch (err: any) {
      console.warn(`[ClassifyService] Classification failed for submission ${payload.submissionId}:`, err.message);
      return null;
    }
  }
}

export const classifyService = new ClassifyService();
