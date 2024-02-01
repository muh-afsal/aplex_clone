const mongoose = require("mongoose");
require("dotenv").config();

const { Schema } = mongoose;

const CouponSchema = new Schema({
  CouponName: { type: String, required: true },
  CouponCode: { type: String, required: true },
  DiscountValue: { type: Number, required: true },
  ExpirationDate: { type: Date, required: true },
  MinPurchaseAmount: { type: Number, required: true },
  MaxPurchaseAmount: { type: Number, required: true },
  IsActive: { type: Boolean, required: true },
  isUsed: { type: Boolean,default:false },
  StartDate: { type: Date, required: true },
  createdAt: {type: Date,required:true}
});

const Coupon = mongoose.model(process.env.COUPON_COLLECTION, CouponSchema);

module.exports = Coupon;
