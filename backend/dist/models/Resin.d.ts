import mongoose, { Document } from 'mongoose';
export interface IResin extends Document {
    name: string;
    materialId: string;
    materialName: string;
    weight: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResin, {}, {}, {}, mongoose.Document<unknown, {}, IResin, {}, {}> & IResin & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Resin.d.ts.map