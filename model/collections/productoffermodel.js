const mongoose=require ('mongoose')
require('dotenv').config()


const ProductOffers=new mongoose.Schema({
    ProductName:{
        type:String 
    },
    OfferPersentage:{
        type:Number
    },
    Added:{
        type:Date
    },
    EndDate:{
        type:Date
    },
    Status:{
         type:Boolean,
         default:true,
    }
   
})

const Productoffermodel=mongoose.model(process.env.PRODUCT_OFFERS_COLLECTION,ProductOffers)

module.exports=Productoffermodel