const mongoose = require("mongoose");
require("dotenv").config();

const Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
  },

  profileImage: {
    type: String,
  },
  address: [
    {
      shippingName: { type: String },
      phone: { type: Number },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: Number },
    },
  ],
  emailAuth: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
  },
  status: {
    type: Boolean,
    default: true,
  },
  access: {
    type: Boolean,
    default: true,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  Activity: [
    {
      TransactionType: { type: String, enum: ["credit", "debit"] },
      message: { type: String },
      Date: { type: Date },
      amount:{type:Number},
      TransactionID: { type: String },
    },
  ],
  ReferalID:{
    type:String
  }
});

const Users = mongoose.model(process.env.USER_COLLECTION, Schema);
module.exports = Users;
