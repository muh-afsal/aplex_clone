const mongoose=require ('mongoose')
require('dotenv').config()


const ReferalOffers=new mongoose.Schema({
    BonusPrice:{
        type:Number 
    },
    Joincount:{
        type:Number 
    },
    Added:{
        type:Date
    },
    Status:{
         type:Boolean,
    }
   
})

const Referaloffermodel=mongoose.model(process.env.REFERAL_OFFERS_COLLECTION,ReferalOffers)

module.exports=Referaloffermodel