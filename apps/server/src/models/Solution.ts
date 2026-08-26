import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Verdict, Verdicts, SupportedLanguage, ALL_VERDICTS } from '@anti-oj/shared';

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
    },
    language: {
      type: String,
      required: true,
      enum: ['cpp', 'python'],
    },
    verdict: {
      type: String,
      enum: ALL_VERDICTS,
      default: Verdicts.PENDING,
      index: true,
    },
    compileOutput: {
      type: String,
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

export const Solution: Model<ISolutionDocument> = mongoose.model<ISolutionDocument>(
  'Solution',
  solutionSchema
);
