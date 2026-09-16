import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  customer: { name: { type: String, required: true }, email: { type: String, required: true, lowercase: true, trim: true }, phone: String },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, quantity: { type: Number, min: 1 } }],
  shippingAddress: { address: String, city: String, state: String, country: { type: String, default: 'Nigeria' } },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  couponCode: { type: String, default: '' },
  shippingFee: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['paystack', 'flutterwave', 'cash_on_delivery'], default: 'paystack' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  reference: { type: String, unique: true, sparse: true },
  notes: { type: String, default: '' }
}, { timestamps: true })

orderSchema.index({ 'customer.email': 1, createdAt: -1 })
export default mongoose.model('Order', orderSchema)
