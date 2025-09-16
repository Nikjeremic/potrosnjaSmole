import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IDisposal, {}, {}, {}, mongoose.Document<unknown, {}, IDisposal, {}, {}> & IDisposal & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Disposal.d.ts.map