import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IConsumption, {}, {}, {}, mongoose.Document<unknown, {}, IConsumption, {}, {}> & IConsumption & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Consumption.d.ts.map