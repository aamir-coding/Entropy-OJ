import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import {
  JudgeJobPayload,
  QueueConfig,
  Verdicts,
} from '@anti-oj/shared';
import { redisConnectionOptions } from '../config/redis';
import { evaluateSubmission } from '../sandbox/evaluator';
import { env } from '../config/env';

// Shared Mongoose schemas for worker direct database updates (Decision R8)
const solutionSchema = new mongoose.Schema(
  {
    verdict: String,
    compileOutput: String,
    executionTime: Number,
    memoryUsed: Number,
    failedTestCaseNumber: Number,
    totalTestCases: Number,
    passedTestCases: Number,
  },
  { strict: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    problem: mongoose.Schema.Types.ObjectId,
    input: String,
    output: String,
    isSample: Boolean,
    order: Number,
  },
  { strict: false }
);

const problemSchema = new mongoose.Schema(
  {
    acceptedSubmissions: Number,
  },
  { strict: false }
);

const SolutionModel = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);
const TestCaseModel = mongoose.models.TestCase || mongoose.model('TestCase', testCaseSchema);
const ProblemModel = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

export function createSubmissionWorker(): Worker<JudgeJobPayload> {
  const worker = new Worker<JudgeJobPayload>(
    QueueConfig.SUBMISSION_QUEUE_NAME,
    async (job: Job<JudgeJobPayload>) => {
      console.log(`\n[Worker] 📥 Processing Job ${job.id} - Submission ${job.data.submissionId} (${job.data.language})`);
      const startTime = Date.now();

      try {
        // Fetch test cases for this problem from MongoDB
        const testCases = await TestCaseModel.find({ problem: job.data.problemId })
          .sort({ order: 1 })
          .lean();

        if (!testCases || testCases.length === 0) {
          console.warn(`[Worker] No test cases found for problem ${job.data.problemId}`);
          await SolutionModel.findByIdAndUpdate(job.data.submissionId, {
            verdict: Verdicts.INTERNAL_ERROR,
            compileOutput: 'No test cases found for this problem in database.',
          });
          return;
        }

        // Run sandboxed evaluation
        const result = await evaluateSubmission(job.data, testCases as any);

        // Update Solution document in MongoDB
        await SolutionModel.findByIdAndUpdate(job.data.submissionId, {
          verdict: result.verdict,
          compileOutput: result.compileOutput,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          failedTestCaseNumber: result.failedTestCaseNumber,
          totalTestCases: result.totalTestCases,
          passedTestCases: result.passedTestCases,
        });

        // If Accepted, increment problem acceptedSubmissions
        if (result.verdict === Verdicts.ACCEPTED) {
          await ProblemModel.findByIdAndUpdate(job.data.problemId, {
            $inc: { acceptedSubmissions: 1 },
          });
        }

        const duration = Date.now() - startTime;
        console.log(
          `[Worker] ✅ Finished Submission ${job.data.submissionId} -> Verdict: [${result.verdict}] ` +
            `(${result.passedTestCases}/${result.totalTestCases} passed, ` +
            `${result.executionTime}ms CPU, ${result.memoryUsed}KB RAM) [Job completed in ${duration}ms]`
        );
      } catch (error: any) {
        console.error(`[Worker] ❌ Unhandled worker error for submission ${job.data.submissionId}:`, error);

        await SolutionModel.findByIdAndUpdate(job.data.submissionId, {
          verdict: Verdicts.INTERNAL_ERROR,
          compileOutput: `Internal Judge Worker Exception: ${error.message || 'Unknown error'}`,
        });

        throw error;
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on('ready', () => {
    console.log(`[Worker] 🚀 BullMQ Submission Worker ready (Concurrency: ${env.WORKER_CONCURRENCY})`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
