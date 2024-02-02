const Cart = require("../model/collections/cartmodel");
const Products = require("../model/collections/productmodel");

async function productAddtocart(productId, userId, res) {
  try {
    const cartExist = await Cart.findOne({ User: userId });
    const productData = await Products.findOne({ _id: productId });

    if (!productData || productData.Stock <= 0) {
      return res.json({ success: false, message: "Product out of stock" });
    }

    const productExist = await Cart.findOne({
      User: userId,
      "Items.Products": productId,
    });

    if (productExist) {
      return res.json({ success: false, message: "Product already in the cart" });
    }

    if (!cartExist) {
      const newCart = new Cart({
        User: userId,
        Items: [
          {
            Products: productId,
            Quantity: 1,
          },
        ],
        TotalAmount: 0,
        createdAt: Date.now(),
        UpdatedAt: Date.now(),
      });

      await newCart.save();
    } else {
      const productExist = await Cart.findOne({
        User: userId,
        "Items.Products": productId,
      });

      if (!productExist) {
        await Cart.updateOne(
          { User: userId },
          { 
            $push: { Items: { Products: productId, Quantity: 1 } },
            $set: { UpdatedAt: Date.now() } 
          }
        );
      } else {
        await Cart.updateOne(
          { User: userId, "Items.Products": productId },
          { 
            $inc: { "Items.$.Quantity": 1 },
            $set: { UpdatedAt: Date.now() } 
          }
        );
      }
    }

    const discount = cartExist.DiscountAmount;
    let total = 0;

    if (productData.isOffer) {
      total = productData.DiscountPrice;
    } else {
      total = await calculateTotalPrice(userId);
    }

    const totalAmount = total - discount;

    await Cart.updateOne({ User: userId }, { $set: { TotalAmount: totalAmount } });

    res.json({ status: true, message: "Product added to cart successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding product to cart" });
  }
}

function calculateTotalPrice(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let cartData = await Cart.findOne({ User: userId });

      let Total = 0;

      await Promise.all(
        cartData.Items.map(async (data) => {
          let subtotal;
          let productData = await Products.findOne({ _id: data.Products });
          if (productData.isOffer) {
            subtotal = productData.DiscountPrice * data.Quantity;
          } else {
            subtotal = productData.Price * data.Quantity;
          }
          Total += subtotal;
        })
      );

      resolve(Total);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { productAddtocart, calculateTotalPrice };
