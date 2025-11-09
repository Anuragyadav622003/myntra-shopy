import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      image: String,
      price: Number,
      size: String,
      color: String,
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    pinCode: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: Date,
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  this.taxPrice = this.itemsPrice * 0.18;
  this.shippingPrice = this.itemsPrice > 999 ? 0 : 40;
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
