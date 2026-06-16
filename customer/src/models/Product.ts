import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  shape: string;
  sizeOptions: Array<{ size: string; price: number }>;
  isActive: boolean;
}

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shape: { type: String, required: true }, // e.g. "Square", "Round", "Heart"
  sizeOptions: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
