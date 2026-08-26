import mongoose, { Document, Model, Schema } from 'mongoose';
import { ProblemDifficulty, ISampleTestCase } from '@anti-oj/shared';

export interface IProblemDocument extends Document {
  problemCode: string;
  name: string;
  statement: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleCases: ISampleTestCase[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  createdAt: Date;
}

const sampleCaseSchema = new Schema<ISampleTestCase>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const problemSchema = new Schema<IProblemDocument>(
  {
    problemCode: {
      type: String,
      required: [true, 'Problem code is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Problem name is required'],
      trim: true,
    },
    statement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    timeLimitMs: {
      type: Number,
      default: 1000,
      min: 100,
      max: 5000,
    },
    memoryLimitKb: {
      type: Number,
      default: 256 * 1024, // 256 MB
      min: 16 * 1024,
      max: 512 * 1024,
    },
    sampleCases: {
      type: [sampleCaseSchema],
      default: [],
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const Problem: Model<IProblemDocument> = mongoose.model<IProblemDocument>(
  'Problem',
  problemSchema
);
