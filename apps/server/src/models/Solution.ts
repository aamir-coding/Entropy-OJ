import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Verdict, Verdicts, SupportedLanguage, ALL_VERDICTS, IApproachClassification } from '@entropy-oj/shared';

export interface ISolutionDocument extends Document {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  code: string;
  language: SupportedLanguage;
  verdict: Verdict;
  compileOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  failedTestCaseNumber?: number;
  totalTestCases?: number;
  passedTestCases?: number;
  classification?: IApproachClassification;
  submittedAt: Date;
}

const solutionSchema = new Schema<ISolutionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      maxlength: 65536,
    },
    language: {
      type: String,
      required: true,
      enum: ['cpp', 'python'],
    },
    verdict: {
      type: String,
      enum: ALL_VERDICTS as unknown as string[],
      default: Verdicts.PENDING,
      index: true,
    },
    compileOutput: {
      type: String,
      maxlength: 65536,
    },
    executionTime: {
      type: Number,
    },
    memoryUsed: {
      type: Number,
    },
    failedTestCaseNumber: {
      type: Number,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    classification: {
      approach: { type: String },
      timeComplexity: { type: String },
      spaceComplexity: { type: String },
      relatedProblemCode: { type: String },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for optimal query performance
solutionSchema.index({ user: 1, problem: 1 });
solutionSchema.index({ user: 1, verdict: 1 });
solutionSchema.index({ user: 1, submittedAt: -1 });
solutionSchema.index({ problem: 1, submittedAt: -1 });

export const Solution: Model<ISolutionDocument> = mongoose.model<ISolutionDocument>(
  'Solution',
  solutionSchema
);
