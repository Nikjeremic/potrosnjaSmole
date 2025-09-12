import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IInventory, {}, {}, {}, mongoose.Document<unknown, {}, IInventory, {}, {}> & IInventory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Inventory.d.ts.map