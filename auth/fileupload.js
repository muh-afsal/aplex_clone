const multer =require('multer')


// Set up Multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/product-images'); // specify the folder where the images will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + (file.originalname));
    }
  });



  module.exports=storage;