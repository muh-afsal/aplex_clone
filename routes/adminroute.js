const multer = require("multer");
const { checkAdminAuth } = require("../auth/adminauth");
const productStorage = require("../auth/fileupload");
const productUpload = multer({ storage: productStorage });
const express = require("express");
const router = express.Router();
const adminController = require("../controller/admincontroller");
const productController = require("../controller/productcontroller");
const categoryController = require("../controller/categorycontroller");
const orderController = require("../controller/adminorderscontroller");
const couponController = require("../controller/couponcontroller");
const OfferController = require("../controller/offerscontroller");

const adminAuth = require("../auth/adminauth");

const uploadObj = [
  { name: "main-image", maxCount: 1 },
  { name: "sub-image", maxCount: 4 },
];

router.get("/adminlogin", adminController.loadAdminLogin);
router.post("/adminlogin", adminController.loginAdmin);
router.get("/admin", checkAdminAuth, adminController.LoadAdminDash);
router.get('/count-orders-by-day', adminController.getCount)
router.get('/count-orders-by-month', adminController.getCount)
router.get('/count-orders-by-year', adminController.getCount)
router.get('/latestOrders', adminController.getOrdersAndSellers)
router.get("/manageProduct", checkAdminAuth, productController.LoadmanageProduct);
router.get("/addproduct", checkAdminAuth, productController.LoadaddProduct);
router.post("/addProduct", productUpload.fields(uploadObj), productController.addProduct);
router.get("/editProduct", checkAdminAuth, productController.editProductLoad);
router.post("/editProduct", productUpload.fields(uploadObj), productController.UpdateProduct);
router.get("/deleteProduct", productController.softDeleteProduct);
router.get("/manageUser", checkAdminAuth, adminController.manageUser);
router.post("/blockUnblockUser", adminController.blockUnblockUser);
router.get("/manageCategory", checkAdminAuth, categoryController.LoadmanageCategory);
router.get("/addCategory", checkAdminAuth, categoryController.LoadaddCategory);
router.post("/addCategory", categoryController.addCategory);
router.get("/editCategory", checkAdminAuth, categoryController.LoadEditCategory);
router.post("/editCategory", categoryController.UpdateCategory);
router.get("/deleteCategory", categoryController.softDeleteCategory);
router.get("/orders", checkAdminAuth, orderController.LoadOrders);
router.get("/orderdetails", checkAdminAuth, orderController.Orderdetails);
router.post("/updateOrderStatus/:orderId", checkAdminAuth, orderController.UpdateOrderStatus);
router.post("/updatePaymentStatus/:orderId", checkAdminAuth, orderController.UpdatePaymentStatus);
router.get("/adminlogout", (req, res) => { req.session.adminAuth = false; res.redirect("/admin/adminlogin"); });
router.get("/Managecoupon",checkAdminAuth,couponController.LoadManageCoupons)
router.post("/addCoupon",checkAdminAuth, couponController.addCoupon);
router.post("/deleteCoupon/:id",checkAdminAuth, couponController.deleteCoupon);
router.post("/editCoupon",checkAdminAuth, couponController.editCoupon);
router.get("/returndetails",checkAdminAuth, orderController.LoadReturnreq);
router.post("/acceptReturnRequest/:orderId",checkAdminAuth, orderController.acceptReturnRequest);
router.post("/rejectReturnRequest/:orderId",checkAdminAuth, orderController.rejectReturnRequest);
router.get("/categoryOffers",checkAdminAuth, OfferController.LoadManageCategoryOffers);
router.get("/productOffers",checkAdminAuth, OfferController.LoadManageProductOffers);
router.get("/referalOffers",checkAdminAuth, OfferController.LoadManageReferalOffers);
router.get("/disableReferalOffers",checkAdminAuth, OfferController.DisableReferalOffers);
router.get("/enableReferalOffers",checkAdminAuth, OfferController.EnableReferalOffers);
router.post("/editReferal",checkAdminAuth, OfferController.EditReferal);
router.post("/addcategoryOffer",checkAdminAuth, OfferController.AddCategoryOffer);
router.post("/editcategoryoffer",checkAdminAuth, OfferController.EditCategoryOffer);
router.post("/deletecategoryOffer/:id",checkAdminAuth, OfferController.DeleteCategoryOffer);
router.post("/addproductoffer",checkAdminAuth, OfferController.AddProductOffer);
router.post("/deleteproductOffer/:id",checkAdminAuth, OfferController.DeleteProductOffer);
router.post("/editproductoffer",checkAdminAuth, OfferController.EditProductsOffer);
router.post("/salesReport",checkAdminAuth, OfferController.genereatesalesReport);


module.exports = router;
