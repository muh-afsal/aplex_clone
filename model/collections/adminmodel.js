const mongoose=require ('mongoose')
require('dotenv').config()

const Schema= new mongoose.Schema({

    name:{
        type:String,
        required:true,
        // unique:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        
    },
   
    date:{
        type:Date
    },
 
})

const Admin=mongoose.model(process.env.ADMIN_COLLECTION,Schema)
module.exports=Admin