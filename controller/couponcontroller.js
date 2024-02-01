const session = require("express-session");
const { ObjectId } = require("mongodb");
const Coupon = require("../model/collections/couponmodel");
const Cart = require("../model/collections/cartmodel");
var cron = require("node-cron");

//generating coupon id --------------->
const generateOrderNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderNumber = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }
  return orderNumber;
};

// Load Manage Coupon------------->
const LoadManageCoupons = async (req, res) => {
  try {
    const Coupons = await Coupon.find().sort({ createdAt: -1 });

    res.render("../views/admin/managecoupon.ejs", { Coupons, err: null });
  } catch (error) {
    console.log(error);
  }
};

// Add coupon------------------->
const addCoupon = async (req, res) => {
  try {
    const couponName = req.body.newCouponName;
    const DiscountValue = req.body.newDiscountValue;
    const couponCode = generateOrderNumber();
    const minPurchaseAmount = req.body.newminPurchaceAmount;
    const maxPurchaseAmount = req.body.newmaxPurchaseAmount;
    const startDate = req.body.newstartDate;
    const expireDate = req.body.newexpiringDate;

    const couponNamecheck = couponName.toLowerCase();

    const CouponExist = await Coupon.findOne({
      CouponName: { $regex: new RegExp(`^${couponNamecheck}$`, "i") },
    });

    if (CouponExist) {
      const Coupons = await Coupon.find();
      res.render("../views/admin/managecoupon", {
        Coupons,
        err: `A Coupon named "${couponName}" alredy exists`,
      });
    } else {
      const newCoupon = new Coupon({
        CouponName: couponName,
        CouponCode: couponCode,
        DiscountValue: DiscountValue,
        StartDate: startDate,
        ExpirationDate: expireDate,
        MinPurchaseAmount: minPurchaseAmount,
        MaxPurchaseAmount: maxPurchaseAmount,
        IsActive: true,
        createdAt: Date.now(),
      });

      const couponsaved = await newCoupon.save();

      res.redirect("/admin/Managecoupon");
    }
  } catch (error) {}
};

//cheaking the expire date of the coupon--------->
cron.schedule("* * * * * *", async () => {
  try {
    const currentDate = new Date();

    await Coupon.updateMany(
      {
        ExpirationDate: { $lt: currentDate },
      },
      { $set: { IsActive: false } }
    );
  } catch (error) {
    console.error("Error updating coupons:", error);
  }
});

// Edit coupon----------------->
const editCoupon = async (req, res) => {
  try {
    const {
      CouponName,
      DiscountValue,
      minPurchaceAmount,
      maxPurchaceAmount,
      startDate,
      expiringDate,
    } = req.body;
    const couponid = req.query._id;

    const couponNamecheck = CouponName.toLowerCase();
    const CouponExist = await Coupon.findOne({
      CouponName: { $regex: new RegExp(`^${couponNamecheck}$`, "i") },
      _id: { $ne: couponid },
    });

    if (CouponExist) {
      const Coupons = await Coupon.find().sort({ createdAt: -1 });
      res.render("../views/admin/managecoupon", {
        Coupons,
        err: `A Coupon named "${CouponName}" alredy exists`,
      });
    } else {
      const coupunUpdate = await Coupon.findByIdAndUpdate(couponid, {
        $set: {
          CouponName: CouponName,
          DiscountValue: DiscountValue,
          ExpirationDate: expiringDate,
          MinPurchaseAmount: minPurchaceAmount,
          MaxPurchaseAmount: maxPurchaceAmount,
          StartDate: startDate,
          IsActive: true,
        },
      });

      if (coupunUpdate) {
        res.redirect("/admin/Managecoupon");
      } else {
        const Coupons = await Coupon.find().sort({ createdAt: -1 });
        res.render("../views/admin/managecoupon", {
          err: "Update failed",
          Coupons,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Delete coupon-------------------->
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    const result = await Coupon.findByIdAndDelete(couponId);

    if (result) {
      return res.json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const LoadUserCoupons = async (req, res) => {
  try {
    const couponData = await Coupon.find({
      IsActive: true,
      isUsed: false,
    }).sort({ createdAt: -1 });

    const currentDate = new Date();

    res.render("../views/user/coupons.ejs", { couponData });
  } catch (error) {
    console.log(error);
  }
};
const ApplyCoupons = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const orderid = req.body.orderid;

    const coupon = await Coupon.findOne({ CouponCode: couponCode });
    const cart = await Cart.findOne({ _id: orderid });

    if (!coupon || !cart) {
      return res.status(404).json({ success: false, message: "Coupon or Cart not found!" });
    }

    if (coupon.IsActive === false) {
      return res.json({ success: false, message: "Coupon has Expired!" });
    }
    if (coupon.isUsed === true) {
      return res.json({ success: false, message: "The coupon code has already been used!" });
    }
    if (cart.couponUsed === true) {
      return res.json({ success: false, message: "You have already used one coupon for this order!" });
    }
    if (cart.TotalAmount < coupon.MinPurchaseAmount) {
      return res.json({ success: false, message: `Minimum Purchase amount of this coupon is ${coupon.MinPurchaseAmount}` });
    }
    if (cart.TotalAmount > coupon.MaxPurchaseAmount) {
      return res.json({ success: false, message: `Maximum Purchase amount of this coupon is ${coupon.MaxPurchaseAmount}` });
    }

    const currentDate = new Date();
    if (currentDate > coupon.ExpirationDate) {
      return res.json({ success: false, message: "Coupon has Expired!" });
    }

    const carttotal = cart.TotalAmount;
    const discountValue = coupon.DiscountValue;
    const couponDiscountTotal = carttotal - discountValue;

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: orderid },
      {
        $set: {
          TotalAmount: couponDiscountTotal,
          DiscountAmount: discountValue,
          couponUsed: true,
          usedCoupon: couponCode,
        },
      },
      { new: true } 
    );

    coupon.isUsed = true;
    await coupon.save();

    return res.json({
      success: true,
      message: "Coupon applied successfully",
      discountValue: coupon.DiscountValue,
      minpurchase: coupon.MinPurchaseAmount,
      maxpurchase: coupon.MaxPurchaseAmount,
      totalAmount: updatedCart.TotalAmount, // Use the updated total amount from the cart
      isused: coupon.isUsed,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Please fill the coupon Input" });
  }
};


// cancelling the coupon---------------------------------------------------------------------
const CancelCoupon = async (req, res) => {
  try {
    const orderID = req.body.orderid;
    const cart = await Cart.findOne({ _id: orderID });
    const couponcode=cart.usedCoupon;
    

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found!" });
    }

    if (cart.couponUsed) {
      cart.TotalAmount += cart.DiscountAmount;
      cart.DiscountAmount = 0;
      cart.couponUsed = false;
      cart.UpdatedAt = new Date();

      cart.usedCoupon = null;

      await cart.save();

     

      const coupon = await Coupon.findOne({ CouponCode: couponcode });
  

      if (coupon) {
        coupon.isUsed = false;
        await coupon.save();
      }

      return res.status(200).json({
        success: true,
        message: "Coupon canceled successfully!",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No coupon used for this order!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong while canceling the coupon!",
      });
  }
};




module.exports = {
  LoadManageCoupons,
  addCoupon,
  deleteCoupon,
  editCoupon,
  LoadUserCoupons,
  ApplyCoupons,
  CancelCoupon,
};
