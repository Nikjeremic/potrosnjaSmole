import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IReceipt, {}, {}, {}, mongoose.Document<unknown, {}, IReceipt, {}, {}> & IReceipt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Receipt.d.ts.map