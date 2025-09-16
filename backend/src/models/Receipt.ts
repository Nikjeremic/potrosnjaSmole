import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  materialId: mongoose.Types.ObjectId;
  materialName: string;
  receiptDate: Date;
  receiptTime: string;
  transporter: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema: Schema = new Schema({
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  receiptDate: {
    type: Date,
    required: true
  },
  receiptTime: {
    type: String,
    required: true
  },
  transporter: {
    type: String,
    required: true
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
  notes: {
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
ReceiptSchema.index({ materialId: 1, receiptDate: -1 });
ReceiptSchema.index({ receiptDate: -1 });

export default mongoose.model<IReceipt>('Receipt', ReceiptSchema);
