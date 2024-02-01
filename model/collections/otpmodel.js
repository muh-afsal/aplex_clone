const mongoose=require ('mongoose')
require('dotenv').config()


const otp=new mongoose.Schema({
    otp:{
        type:Number
      
    },
    email:{
        type:String
        
    },
    otpAdded:{
      type:Date
    },
    ExpireAt:{
      type:Date
    }
})

const otpmodel=mongoose.model(process.env.OTP_COLLECTION,otp)

module.exports=otpmodel