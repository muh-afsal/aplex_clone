const mongoose=require ('mongoose')
require('dotenv').config()


const categoryOffers=new mongoose.Schema({
    CategoryName:{
        type: mongoose.Schema.Types.ObjectId, ref:process.env.CATEGORY_COLLECTION
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

const categoryoffermodel=mongoose.model(process.env.CATEGORY_OFFERS_COLLECTION,categoryOffers)

module.exports=categoryoffermodel