const User = require("../model/collections/usermodel");
const OTP = require("../model/collections/otpmodel");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const Product = require("../model/collections/productmodel");
const category = require("../model/collections/categorymodel");
const Cart = require("../model/collections/cartmodel");
const Products = require("../model/collections/productmodel");
const Wishlist = require("../model/collections/wishlistmodel");
const {
  productAddtocart,
  calculateTotalPrice,
} = require("../helper/carthelper");

const LoadWishlist = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;

    const WishlistProducts = await Wishlist.findOne({
      UserId: userId,
    }).populate({
      path: "Items.Products",
    });

    if (!WishlistProducts) {
      return res.render("../views/user/wishlist.ejs", { WishlistProducts: [] });
    }

    res.render("../views/user/wishlist.ejs", {
      WishlistProducts: WishlistProducts.Items || [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const addtoWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;

    const product = await Products.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const wishlist = await Wishlist.findOne({ UserId: userId });

    if (wishlist) {
      const isProductInWishlist = wishlist.Items.some((item) =>
        item.Products.equals(productId)
      );

      if (isProductInWishlist) {
        return res.json({
          success: false,
          message: "Product is already in the wishlist",
        });
      }

      wishlist.Items.push({
        Products: productId,
      });

      await wishlist.save();
      return res.json({ success: true, message: "Product added to wishlist" });
    } else {
      await Wishlist.create({
        UserId: userId,
        Items: [
          {
            Products: productId,
          },
        ],
      });

      return res.json({ success: true, message: "Product added to wishlist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const RemoveFromWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;

    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;

    const userWishlist = await Wishlist.findOne({ UserId: userId });

    if (!userWishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    userWishlist.Items = userWishlist.Items.filter(
      (item) => item.Products.toString() !== productId
    );

    await userWishlist.save();

    res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  LoadWishlist,
  addtoWishlist,
  RemoveFromWishlist,
};
