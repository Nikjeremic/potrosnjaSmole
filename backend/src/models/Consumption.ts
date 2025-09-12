import mongoose, { Document, Schema } from 'mongoose';

export interface IConsumption extends Document {
  date: string;
  shift: 'first' | 'second' | 'third';
  employeeName: string;
  resinId: string;
  resinName: string;
  materialId: string;
  materialName: string;
  resinWeight: number;
  usageCount: number;
  totalConsumption: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConsumptionSchema: Schema = new Schema({
  date: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true,
    enum: ['first', 'second', 'third']
  },
  employeeName: {
    type: String,
    required: true
  },
  resinId: {
    type: String,
    required: true
  },
  resinName: {
    type: String,
    required: true
  },
  materialId: {
    type: String,
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  resinWeight: {
    type: Number,
    required: true,
    min: 0
  },
  usageCount: {
    type: Number,
    required: true,
    min: 0
  },
  totalConsumption: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IConsumption>('Consumption', ConsumptionSchema);
