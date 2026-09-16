import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{ label: String, address: String, city: String, state: String, country: { type: String, default: 'Nigeria' } }]
}, { timestamps: true })

export default mongoose.model('User', userSchema)
