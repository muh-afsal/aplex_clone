const mongoose = require("mongoose");
require("dotenv").config();

const { Schema, ObjectId } = mongoose;

const wishlistSchema = new Schema({
  UserId:{ type:String},
  Items: [
    {
      Products: { type: Schema.Types.ObjectId,ref:process.env.PRODUCT_COLLECTION}
    },
  ]
});

const wishlist = mongoose.model(process.env.WISHLIST_COLLECTION, wishlistSchema);

module.exports = wishlist;

