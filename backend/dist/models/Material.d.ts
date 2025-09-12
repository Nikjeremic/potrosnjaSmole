import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IMaterial, {}, {}, {}, mongoose.Document<unknown, {}, IMaterial, {}, {}> & IMaterial & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Material.d.ts.map