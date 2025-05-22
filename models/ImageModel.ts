// models/ImageModel.ts
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  images: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);