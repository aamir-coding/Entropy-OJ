import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITestCaseDocument extends Document {
  problem: Types.ObjectId;
  input: string;
  output: string;
  isSample: boolean;
  order: number;
}

const testCaseSchema = new Schema<ITestCaseDocument>(
  {
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    isSample: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const TestCase: Model<ITestCaseDocument> = mongoose.model<ITestCaseDocument>(
  'TestCase',
  testCaseSchema
);
