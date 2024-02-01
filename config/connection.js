const mongoose = require("mongoose");
require('dotenv').config()


mongoose
  .connect(process.env.DB_URI,{
  })
  .then(() => {
    
    console.log("db conneted");
  })
  .catch((error) => {
    console.log("error while connecting db");
    console.log(error);
  });