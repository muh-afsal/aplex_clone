const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;


function createRazorpayOrder(order){
   return new Promise((resolve,reject)=>{
    var instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET_ID })
     const createdOrder=instance.orders.create({
        amount: order.amount, 
        currency: "INR",
        receipt: order.receipt,
      });
     if(createdOrder){
         resolve(createdOrder)  

     }else{
        reject("error")
     }
})}


module.exports={
    createRazorpayOrder
}