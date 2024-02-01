const mongoose=require ('mongoose')
require('dotenv').config()


const category=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
      
    },
    description:{
        type:String
        
    },
    date:{
        type:Date
    },
    Status:{
         type:Boolean,
         default:true,
    }
   
})

const categorymodel=mongoose.model(process.env.CATEGORY_COLLECTION,category)

module.exports=categorymodel