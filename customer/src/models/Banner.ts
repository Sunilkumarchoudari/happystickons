import mongoose from 'mongoose';

export interface IBanner extends mongoose.Document {
  title: string;
  subtitle: string;
  bgGradient: string;
  textColor: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: Date;
}

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  bgGradient: { type: String, default: 'linear-gradient(135deg, #4F2C1F, #88644F)' },
  textColor: { type: String, default: '#FFFFFF' },
  linkUrl: { type: String, default: '/create' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
