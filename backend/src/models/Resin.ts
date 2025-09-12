import mongoose, { Document, Schema } from 'mongoose';

export interface IResin extends Document {
  name: string;
  materialId: string;
  materialName: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResinSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  materialId: {
    type: String,
    required: true
  },
  materialName: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IResin>('Resin', ResinSchema);
