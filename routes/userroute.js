const express = require("express");
const multer = require("multer");
const profileimageStorage = require("../auth/profilepicupload");
const profileimageUpload = multer({ storage: profileimageStorage });
const router = express.Router();
const userController = require("../controller/usercontroller");
const productController = require("../controller/productcontroller");
const OTPController = require("../controller/otpcontroller");
const cartController = require("../controller/cartcontroller");
const OrderController = require("../controller/ordercontroller");
const userAuth = require("../auth/userauth");
const couponController = require("../controller/couponcontroller");
const wishlistController = require("../controller/wishlistcontroller");
// const {checkSession}=require('../auth/userandadmin')
const { checkUserAuthentication } = require("../auth/userauth");

router.get("/", userController.landingload);
router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signupUser);
router.get("/login", userController.loadLogin);
router.post("/login", userController.loginUser);
router.get("/logout", userController.LogoutUser);
router.get("/home", userController.loadHome);
router.get("/otp", userController.otpSender);
router.get("/otpentry", userController.LoadOTP);
router.post("/otp", userController.otpverify);
router.get("/ProductDetail", productController.LoadproductDetail);
router.get("/ProductDetailverified", userAuth.checkUserAuthentication, productController.LoadproductDetailVerified);
router.get("/productlisting", productController.ProductListing);
router.get("/productlistingverified", userAuth.checkUserAuthentication, productController.ProductListingverified);
router.get("/cart", userAuth.checkUserAuthentication, cartController.LoadCart);
router.post("/addtocart", userAuth.checkUserAuthentication, cartController.addtoCart);
router.post("/updatequantity/:id", userAuth.checkUserAuthentication, cartController.updateQuantity);
router.delete("/removeproduct/:Id/:rId/:removed", userAuth.checkUserAuthentication, cartController.removeProduct);
router.get("/checkout", userAuth.Orderplaced, userAuth.checkUserAuthentication, cartController.LoadCheckout);
router.post("/addAddress", userAuth.checkUserAuthentication, cartController.AddAdress);
router.post("/placeorder", userAuth.checkUserAuthentication, cartController.LoadOrderPlaced);
router.get("/placeOrder", userAuth.Orderplaced, userAuth.checkUserAuthentication, cartController.LoadorderPlaced);
router.get("/orderDetails", userAuth.checkUserAuthentication, OrderController.LoadOrderDetails);
router.get("/orders", userAuth.checkUserAuthentication, OrderController.LoadOrders);
router.get("/profile", userAuth.checkUserAuthentication, userController.LoadUserProfile);
router.get("/editprofile", userAuth.checkUserAuthentication, userController.LoadeditProfile);
router.post("/editprofile", profileimageUpload.single("image"), userAuth.checkUserAuthentication, userController.editUserProfile);
router.get("/cancelOrder/:id", userAuth.checkUserAuthentication, OrderController.cancelOrder);
router.post("/returnOrder/:id", userAuth.checkUserAuthentication, OrderController.returnOrder);
router.get("/address", userAuth.checkUserAuthentication, userController.LoadAdress);
router.post("/adduserAddress", userAuth.checkUserAuthentication, userController.AddAdress);
router.post("/edituserAddress", userAuth.checkUserAuthentication, userController.editAdress);
router.post("/generateRazorpay",userAuth.checkUserAuthentication,cartController.generateRazorpay)
router.post("/deleteUserAddress/:id",userAuth.checkUserAuthentication,userController.DeleteuserAddress)
router.get("/coupon",userAuth.checkUserAuthentication,couponController.LoadUserCoupons)
router.post("/applycoupon",userAuth.checkUserAuthentication,couponController.ApplyCoupons)
router.post("/cancelcoupon",userAuth.checkUserAuthentication,couponController.CancelCoupon)
router.get("/wallet",userAuth.checkUserAuthentication,userController.LoadWallet)
router.post("/productfiltering",productController.Productfiltering)
router.get("/wishlist",userAuth.checkUserAuthentication,wishlistController.LoadWishlist)
router.post("/addtowishlist", userAuth.checkUserAuthentication, wishlistController.addtoWishlist);
router.post("/removeFromWishlist",userAuth.checkUserAuthentication,wishlistController.RemoveFromWishlist)
router.post("/generateInvoices",userAuth.checkUserAuthentication,OrderController.GenerateInvoices)
router.get("/downloadinvoice/:orderId",userAuth.checkUserAuthentication,OrderController.downloadInvoice)





module.exports = router;
