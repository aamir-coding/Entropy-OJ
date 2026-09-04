import { Worker, Job } from 'bullmq';
import mongoose, { Schema, Document } from 'mongoose';
import {
  JudgeJobPayload,
  QueueConfig,
  Verdicts,
  ALL_VERDICTS,
  ALL_SUPPORTED_LANGUAGES,
  Verdict,
} from '@anti-oj/shared';
import { redisConnectionOptions } from '../config/redis';
import { evaluateSubmission } from '../sandbox/evaluator';
import { env } from '../config/env';

interface ISolutionDoc extends Document {
  user: mongoose.Types.ObjectId;
  problem: mongoose.Types.ObjectId;
  code: string;
  language: string;
  verdict: Verdict;
  compileOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  failedTestCaseNumber?: number;
  totalTestCases?: number;
  passedTestCases?: number;
  classification?: {
    approach?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    relatedProblemCode?: string;
    confidence?: number;
  };
  submittedAt: Date;
}

interface IProblemDoc extends Document {
  acceptedSubmissions: number;
  totalSubmissions: number;
}

interface ITestCaseDoc extends Document {
  problem: mongoose.Types.ObjectId;
  input: string;
  output: string;
  isSample: boolean;
  order: number;
}

// Typed Mongoose schemas for worker updates
const solutionSchema = new Schema<ISolutionDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, enum: ALL_SUPPORTED_LANGUAGES, required: true },
    verdict: { type: String, enum: ALL_VERDICTS, default: Verdicts.PENDING },
    compileOutput: { type: String },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    failedTestCaseNumber: { type: Number },
    totalTestCases: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },
    classification: {
      approach: { type: String },
      timeComplexity: { type: String },
      spaceComplexity: { type: String },
      relatedProblemCode: { type: String },
      confidence: { type: Number },
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { strict: true, versionKey: false }
);

const testCaseSchema = new Schema<ITestCaseDoc>(
  {
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    isSample: { type: Boolean, default: false },
    order: { type: Number, default: 1 },
  },
  { strict: true, versionKey: false }
);

testCaseSchema.index({ problem: 1, order: 1 });

const problemSchema = new Schema<IProblemDoc>(
  {
    acceptedSubmissions: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
  },
  { strict: false, versionKey: false }
);

const SolutionModel = (mongoose.models.Solution as mongoose.Model<ISolutionDoc>) || mongoose.model<ISolutionDoc>('Solution', solutionSchema);
const TestCaseModel = (mongoose.models.TestCase as mongoose.Model<ITestCaseDoc>) || mongoose.model<ITestCaseDoc>('TestCase', testCaseSchema);
const ProblemModel = (mongoose.models.Problem as mongoose.Model<IProblemDoc>) || mongoose.model<IProblemDoc>('Problem', problemSchema);


export function createSubmissionWorker(): Worker<JudgeJobPayload> {
  const worker = new Worker<JudgeJobPayload>(
    QueueConfig.SUBMISSION_QUEUE_NAME,
    async (job: Job<JudgeJobPayload>) => {
      console.log(`\n[Worker] 📥 Processing Job ${job.id} - Submission ${job.data?.submissionId} (${job.data?.language})`);
      const startTime = Date.now();

      // Runtime payload validation (Issue H-1)
      if (
        !job.data ||
        typeof job.data.submissionId !== 'string' ||
        !job.data.submissionId.trim() ||
        typeof job.data.problemId !== 'string' ||
        !job.data.problemId.trim() ||
        typeof job.data.code !== 'string' ||
        !ALL_SUPPORTED_LANGUAGES.includes(job.data.language as any)
      ) {
        console.error(`[Worker] ❌ Invalid or corrupt job payload for Job ${job.id}:`, job.data);
        return;
      }

      try {
        // Idempotency Check: Verify Solution exists and is in PENDING state
        const currentSolution = await SolutionModel.findById(job.data.submissionId);
        if (!currentSolution) {
          console.warn(`[Worker] Submission ${job.data.submissionId} not found in database. Skipping.`);
          return;
        }

        // If this job was already evaluated to completion, do not re-run (idempotency guard)
        if (currentSolution.verdict !== Verdicts.PENDING) {
          console.log(`[Worker] Submission ${job.data.submissionId} already resolved with verdict [${currentSolution.verdict}]. Skipping re-evaluation.`);
          return;
        }

        // Fetch test cases for this problem from MongoDB
        const testCases = await TestCaseModel.find({ problem: job.data.problemId })
          .sort({ order: 1 })
          .lean();

        if (!testCases || testCases.length === 0) {
          console.warn(`[Worker] No test cases found for problem ${job.data.problemId}`);
          await SolutionModel.findOneAndUpdate(
            { _id: job.data.submissionId, verdict: Verdicts.PENDING },
            {
              $set: {
                verdict: Verdicts.INTERNAL_ERROR,
                compileOutput: 'No test cases found for this problem in database.',
              },
            }
          );
          return;
        }

        // Run sandboxed evaluation
        const result = await evaluateSubmission(job.data, testCases);

        // Atomic transition: Update Solution verdict only if currently PENDING
        const updatedSolution = await SolutionModel.findOneAndUpdate(
          { _id: job.data.submissionId, verdict: Verdicts.PENDING },
          {
            $set: {
              verdict: result.verdict,
              compileOutput: result.compileOutput,
              executionTime: result.executionTime,
              memoryUsed: result.memoryUsed,
              failedTestCaseNumber: result.failedTestCaseNumber,
              totalTestCases: result.totalTestCases,
              passedTestCases: result.passedTestCases,
            },
          },
          { new: false }
        );

        // Only increment problem's acceptedSubmissions if this was a successful first-time transition to ACCEPTED
        if (result.verdict === Verdicts.ACCEPTED && updatedSolution && updatedSolution.verdict === Verdicts.PENDING) {
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
        console.error(`[Worker] ❌ Unhandled worker error for submission ${job.data.submissionId} (Attempt ${job.attemptsMade + 1}):`, error);
        // Do NOT pre-write INTERNAL_ERROR here! Re-throw to allow BullMQ configured retries to run.
        // Final DLQ marking is handled cleanly in the worker.on('failed') listener when retries are exhausted.
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

  // DLQ / Final Failure Handler: Catch jobs that exhausted retries
  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);

    if (job && job.attemptsMade >= (job.opts?.attempts || QueueConfig.DEFAULT_JOB_ATTEMPTS)) {
      console.warn(`[Worker] Job ${job.id} exhausted all retries. Finalizing Solution to INTERNAL_ERROR.`);
      try {
        await SolutionModel.findOneAndUpdate(
          { _id: job.data.submissionId, verdict: Verdicts.PENDING },
          {
            $set: {
              verdict: Verdicts.INTERNAL_ERROR,
              compileOutput: `Job failed evaluation after ${job.attemptsMade} retry attempts: ${err.message}`,
            },
          }
        );
      } catch (dbErr: any) {
        console.error(`[Worker] Failed to write final DLQ status to database:`, dbErr.message);
      }
    }
  });

  return worker;
}
