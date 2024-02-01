const Order = require("../model/collections/ordermodel");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const category = require("../model/collections/categorymodel");
const User = require("../model/collections/usermodel");
const {
  productAddtocart,
  calculateTotalPrice,
} = require("../helper/carthelper");
const Products = require("../model/collections/productmodel");
const Cart = require("../model/collections/cartmodel");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { generateInvoice } = require("../utils/easyinvoice");

// Generate a random string for orderNumber-----------------------------------------------
const generateOrderNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderNumber = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }
  return orderNumber;
};

// Load order details-------------------------------------------------------------------
const LoadOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orderData = await Order.findOne({ _id: orderId }).populate(
      "Items.productId"
    );
    if (orderData) {
      res.render("../views/user/orderdetails", { orderData });
    } else {
      res.send("404");
    }
  } catch (error) {
    console.error(error);
    // res.render('user/404Page')
  }
};

// Load orders-------------------------------------------------------------------
const LoadOrders = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;
    const orderData = await Order.find({ UserID: userId }).sort({
      OrderDate: -1,
    });
    res.render("../views/user/orders", { orderData });
  } catch (error) {
    console.log(error);
  }
};

// Cancell order-------------------------------------------------------------------

const cancelOrder = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });

    const orderId = req.params.id;
    const orderObjectId = new mongoose.Types.ObjectId(orderId);
    const orderData = await Order.findOneAndUpdate(
      { _id: orderObjectId },
      { $set: { Status: "Cancelled", paymentStatus: "Returned" } },
      { new: true }
    );

    if (orderData.Status === "Cancelled") {
      const totalAmount = orderData.TotalPrice;

      user.walletBalance += totalAmount;

      await user.save();

      const transactionId = generateOrderNumber();
      const activityDetails = {
        TransactionType: "credit",
        message: "Order cancelled",
        Date: new Date(),
        amount: totalAmount,
        TransactionID: transactionId,
      };

      user.Activity.push(activityDetails);

      await user.save();

      for (const item of orderData.Items) {
        const productId = item.productId;
        const quantity = item.quantity;

        const product = await Products.findById(productId);
        if (product) {
          product.Stock += quantity; 
          await product.save();
        }
      }
    }

    res.redirect(`/orderDetails?id=${orderObjectId}`);
  } catch (error) {
    console.log(error);
  }
};


// Return order -------------------------------------------------------------------

const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const reason = req.body.returnReason;
    const user = await User.findOne({ email: req.session.email });

    const orderObjectId = new mongoose.Types.ObjectId(orderId);
    const orderData = await Order.findOneAndUpdate(
      { _id: orderObjectId },
      { $set: { Status: "Request Send for Return", returnRequestSend: true } },
      { new: true }
    );

    res.redirect(`/orderDetails?id=${orderObjectId}`);
  } catch (error) {
    console.log(error);
  }
};



//generate invoice
const GenerateInvoices = async (req, res) => {

  try {
    const { orderId } = req.body;

    const orderDetails = await Order.findOne({ _id: orderId })
      .populate("Items.productId");


    if (orderDetails) {
      const invoicePath = await generateInvoice(orderDetails);

      res.json({
        success: true,
        message: "Invoice generated successfully",
        invoicePath,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to generate the invoice" });
    }
  } catch (error) {    
    console.error("error in invoice downloading",error);
    res
      .status(500)
      .json({ success: false, message: "Error in generating the invoice" });
  }
};

// download invoice
const downloadInvoice = async (req, res) => {
  try {
    const id = req.params.orderId;
    const filePath = `D:\\brocamp weekly\\Week11-project-1st\\Aplex\\public\\pdf\\${id}.pdf`;
    res.download(filePath, `invoice.pdf`);
  } catch (error) {
    console.error("Error in downloading the invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in downloading the invoice"});
  }
};





module.exports = {
  LoadOrderDetails,
  LoadOrders,
  cancelOrder,
  returnOrder,
  GenerateInvoices,
  downloadInvoice
};
