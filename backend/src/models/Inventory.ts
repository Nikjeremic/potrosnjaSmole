import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  materialId?: string;
  materialName?: string;
  resinId?: string;
  resinName?: string;
  totalWeight: number;
  consumedWeight: number;
  availableWeight: number;
  unit: string;
  lastUpdated: Date;
}

const InventorySchema: Schema = new Schema({
  materialId: {
    type: String,
  },
  materialName: {
    type: String,
  },
  resinId: {
    type: String,
  },
  resinName: {
    type: String,
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
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate available weight
InventorySchema.pre('save', function(next) {
  this.availableWeight = (this.totalWeight as number) - (this.consumedWeight as number);
  next();
});

export default mongoose.model<IInventory>('Inventory', InventorySchema);
