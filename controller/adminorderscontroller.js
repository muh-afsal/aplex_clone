const Orders = require("../model/collections/ordermodel");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const category = require("../model/collections/categorymodel");
const User = require("../model/collections/usermodel");
const Products = require("../model/collections/productmodel");
const Cart = require("../model/collections/cartmodel");


const generateOrderNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderNumber = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }
  return orderNumber;
};


// Load orders funciton----------------------------------->
const LoadOrders = async (req, res) => {
  const orderData = await Orders.find().sort({ OrderDate: -1 });;

  try {
    res.render("../views/admin/manageorders", { orderData });
  } catch (error) {
    console.log(error);
  }
};

// Load order details funciton----------------------------------->

const Orderdetails = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orderData = await Orders.findOne({ _id: orderId }).populate(
      "Items.productId"
    );
    

    res.render("../views/admin/adminorderdetails", { orderData });
  } catch (error) {
    console.error(error);
    
  }
};


// update order status  funciton----------------------------------->

const UpdateOrderStatus = async (req, res) => {
  
  
  try {
    const user = await User.findOne({ email: req.session.email });
    const { orderId } = req.params;
    const { status } = req.body;


    if(status==="Ordered"){
      await Orders.findByIdAndUpdate(orderId, { Status: status });
      res.json({ success: true});

    }
    if(status==="Delivered"){
      await Orders.findByIdAndUpdate(orderId, { Status: status , paymentStatus:"Paid"});
    res.json({ success: true});

    }
    if(status==="Cancelled"){
      await Orders.findByIdAndUpdate(orderId, { Status: status , paymentStatus:"Cancelled"});
    res.json({ success: true});

    }
    

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// update payment status  funciton----------------------------------->

const UpdatePaymentStatus = async (req, res) => {
  
  try {
    const { orderId } = req.params;
    const { status } = req.body;
     

   
      await Orders.findByIdAndUpdate(orderId, { paymentStatus: status });
    


    res
      .status(200)
      .json({ success: true, message: "Payment status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Load return request--------------------------->
const LoadReturnreq=async(req,res)=>{
  try {
     const userData = await User.findOne({ email: req.session.email },{});
     
    const orderData = await Orders.find({returnRequestSend:true}).sort({ OrderDate: -1 });;
      res.render("../views/admin/orderreturns",{orderData})
  } catch (error) {
    console.log(error)
  }
}

// accept return request--------------------------->

// accept return request
const acceptReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderData = await Orders.findById(orderId);
    const userId = orderData.UserID;
    const user = await User.findOne({ _id: userId });

  
    const totalAmount = orderData.TotalPrice;
    user.walletBalance += totalAmount;

    await user.save();

    const transactionId = generateOrderNumber();

    const activityDetails = {
      TransactionType: "credit",
      message: "Order returned",
      Date: new Date(),
      TransactionID: transactionId,
      amount: totalAmount,
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

    await Orders.findByIdAndUpdate(orderId, {
      returnRequestAccept: true,
      Status: "Returned",
      paymentStatus: "Return",
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error accepting return request" });
  }
};


// reject return request--------------------------->

const rejectReturnRequest=async(req,res)=>{
  try {
    const { orderId } = req.params;
    await Orders.findByIdAndUpdate(orderId, { returnRequestAccept: false ,Status:"Order Return Request Rejected !" });
    res.json({ success: false});
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  LoadOrders,
  Orderdetails,
  UpdatePaymentStatus,
  UpdateOrderStatus,
  LoadReturnreq,
  acceptReturnRequest,
  rejectReturnRequest
};
