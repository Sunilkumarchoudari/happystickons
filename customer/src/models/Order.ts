import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  customerName: string;
  email: string;
  address: string;
  items: Array<{
    photoUrl: string;
    shape: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'new' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  items: [
    {
      photoUrl: { type: String, required: true },
      shape: { type: String, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['new', 'processing', 'shipped', 'delivered'],
    default: 'new',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
