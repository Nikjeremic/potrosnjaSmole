import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterial extends Document {
  name: string;
  totalWeight: number;
  consumedWeight: number;
  availableWeight: number;
  unit: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalWeight: {
    type: Number,
    required: true,
    default: 0
  },
  consumedWeight: {
    type: Number,
    required: true,
    default: 0
  },
  availableWeight: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate available weight
MaterialSchema.pre('save', function(next) {
  this.availableWeight = (this.totalWeight as number) - (this.consumedWeight as number);
  next();
});

export default mongoose.model<IMaterial>('Material', MaterialSchema);
