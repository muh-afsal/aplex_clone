const mongoose=require ('mongoose')
require('dotenv').config()



const ProductSchema = new mongoose.Schema({

    isdeleted: {type: Boolean,default:false },
    
    Name: {type: String, required: true, unique:true},
    
    Description: { type: String, required: true },
    
    Image: {
        type:Array,
    },
    Stock:{
        type: Number, required: true
    },
    Category:{
        type: mongoose.Schema.Types.ObjectId, ref:process.env.CATEGORY_COLLECTION
    },
    
    Status: {type: String, enum: ['Draft', 'Published', 'Out of Stock', 'Low Stock'] },
    
    Product_added: { type: Date },
    
    Price: { type: Number, required: true },
    
    DiscountPrice: { type: Number},

    DiscountPercentage: { type: Number},

    isOffer:{type: Boolean},
    Offertype:{type:String}
    
    }, { timestamps: true });
    
    





const Products=mongoose.model(process.env.PRODUCT_COLLECTION,ProductSchema)
module.exports=Products