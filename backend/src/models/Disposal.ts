import mongoose, { Document, Schema } from 'mongoose';

export interface IDisposal extends Document {
  materialId: mongoose.Types.ObjectId;
  materialName: string;
  disposalDate: Date;
  disposalTime: string;
  reason: string;
  quantity: number;
  unit: string;
  description?: string;
  location?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DisposalSchema: Schema = new Schema({
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  disposalDate: {
    type: Date,
    required: true
  },
  disposalTime: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['silos_pukao', 'cev_pukla', 'curenje', 'ostecenje_opreme', 'gubitak_pri_transportu', 'kontaminacija', 'istek_roka', 'ostalo']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
DisposalSchema.index({ materialId: 1, disposalDate: -1 });
DisposalSchema.index({ disposalDate: -1 });
DisposalSchema.index({ reason: 1 });

export default mongoose.model<IDisposal>('Disposal', DisposalSchema);
