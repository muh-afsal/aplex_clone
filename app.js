const express = require("express");
const session=require("express-session")
const app = express();
const userRoute=require("./routes/userroute")
const adminRoute=require("./routes/adminroute")
const mongoose = require("mongoose");
const securekey=process.env.secretkey
const connectdb=require('./config/connection')
require('dotenv').config()
const bcrypt=require("bcrypt")
const Admin = require("./model/collections/adminmodel");
const morgan = require('morgan')



app.use(express.static("public"));
app.use(require('nocache')())

app.use(session({
  secret:process.env.secretkey,
  resave:false,
  saveUninitialized:true
}))

app.set("view engine", "ejs");


app.use(express.urlencoded({extended:true}))
app.use(express.json())



app.use("/",userRoute)
app.use("/admin",adminRoute)


app.use((req, res, next) => {
  res.status(404);

  res.render('../views/user/404.ejs');
});


app.listen(3000, () => {
  
  console.log("server has started on http://localhost:3000");
});
