const User = require("../model/collections/usermodel");
const bcrypt = require("bcrypt");
const OTP = require("../model/collections/otpmodel");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const { sentOTP } = require("./otpcontroller");
const Product = require("../model/collections/productmodel");
const Cart = require("../model/collections/cartmodel");
const Referal = require("../model/collections/referaloffermodel");

const multer = require("multer");
const storage = require("../auth/profilepicupload");

const upload = multer({ storage: storage });




//generating coupon id --------------->
const generateOrderNumber = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderNumber = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }
  return orderNumber;
};



//securing password-------------------------------------------------------------------------------------
const securePassword = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10);
    return passwordhash;
  } catch (error) {
    console.log(error.message);
  }
};

//load landingload-------------------------------------------------------------------------------------
const landingload = async (req, res) => {
  try {
    const products = await Product.find({}).limit(8);

    res.render("../views/user/landing", { products });
  } catch (error) {
    console.log(error.message);
  }
};

//loadSignup---------------------------------------------------------------------------------------

const loadSignup = async (req, res) => {
  try {
    const RferalID=req.query.referalid
    req.session.referalID = RferalID; 
  
    res.render("../views/user/signup");
  } catch (error) {
    console.log(error.message);
  }
};

//signUp----------------------------------------------------------------------------------------------
const signupUser = async (req, res) => {
  try {
    const userinfo = {
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      password: await securePassword(req.body.password),
      
    };

    const emailexist = await User.findOne({ email: userinfo.email });

    if (emailexist) {
      res.render("../views/user/signup", { message: "Email alredy exists" });
    } else {
      const user = {
        username: userinfo.name,
        email: userinfo.email,
        phone: userinfo.phone,
        password: userinfo.password,
        date: Date.now(),
      };
      req.session.data = user;
      res.redirect("/otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//sendng otp---------------------------------------------------------------------------------
const otpSender = async (req, res) => {
  try {
    const email = req.session.data.email;
    const createdOTP = await sentOTP(email);
    req.session.email = email;
    res.redirect("/otpentry");
  } catch (error) {}
};

//LoadOTP-----------------------------------------------------------------------------------

const LoadOTP = async (req, res) => {
  try {
    res.render("../views/user/otp");
  } catch (error) {
    console.log(error);
  }
};

//Load Login-------------------------------------------------------------------------------------
const loadLogin = async (req, res) => {
  try {
    if (req.session && req.session.logged) {
      const dt = await User.findOne({ email: req.session.email });
      if (dt.access) {
        res.redirect("/home");
      } else {
        res.render("../views/user/login", { message: "Permission Denied" });
      }
    } else {
      res.render("../views/user/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//login-----------------------------------------------------------------------------------------------

const loginUser = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const emailexists = await User.findOne({ email: email });
    if (emailexists) {
      if (emailexists.access) {
        const passwordMatch = await bcrypt.compare(
          password,
          emailexists.password
        );
        if (passwordMatch) {
          req.session.logged = true;
          req.session.email = email;
          res.redirect("/home");
        } else {
          res.render("../views/user/login", {
            message: "Incorrect Username or Password",
          });
        }
      } else {
        res.render("../views/user/login", {
          message: "Sorry,You are Blocked by admin...!",
        });
      }
    } else {
      res.render("../views/user/login", { message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//load Home----------------------------------------------------------------------------------

const loadHome = async (req, res) => {
  try {
    if (req.session.orderplaced) {
      req.session.orderplaced = false;
    }
    if (req.session.logged) {
      const products = await Product.find({}).limit(8);

      

      res.render("../views/user/home", { products });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//verify otp---------------------------------------------------------------------------------
const otpverify = async (req, res) => {
  try {
    const data = req.session.data;
    const otp = await OTP.findOne({ email: data.email });

    if (Date.now() > otp.ExpireAt) {
      await OTP.deleteOne({ email: data.email });
      res.render("../views/user/otp", { message: "OTP has expired !" });
    } else {
      const referalID = generateOrderNumber();
      const hashed = otp.otp;
      const code = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
      req.session.email = data.email;
      


      if (hashed == code) {
        if (req.session.referalID) {
          const referalData = await Referal.findOne();

          if (referalData.Status === true) {
            const bonusPrice = referalData.BonusPrice;
            req.session.bonusPrice = bonusPrice;
            
        const refID= req.session.referalID
        const referredUser = await User.findOneAndUpdate(
          { ReferalID: refID },
          { $inc: { walletBalance: bonusPrice } },
          { new: true } 
         );
        
          }
        }

        const newUser = new User({
          username: data.username,
          email: data.email,
          phone: data.phone,
          password: data.password,
          profileImage: "usericons.png",
          date: Date.now(),
          ReferalID: referalID,
        });

        await newUser.save();
        req.session.logged = true;
        req.session.email = data.email;
        res.redirect("/home");
      } else {
        res.render("../views/user/otp", { message: "invalid OTP" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


//Load user Profile
const LoadUserProfile = async (req, res) => {
  try {
    const email = req.session.email;
    const userData = await User.findOne({ email: email });
    res.render("../views/user/userprofile", { userData });
  } catch (error) {
    console.log(error);
  }
};
const LoadeditProfile = async (req, res) => {
  const email = req.session.email;
  const userData = await User.findOne({ email: email });
  try {
    res.render("../views/user/edituserprofile", { userData });
  } catch (error) {
    console.log(error);
  }
};

// Edit user profile-----------------------------------------------------------------
const editUserProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;

    const profileImage = req.file;

    const userData = await User.findOne({ email: req.session.email });

    const updateFields = {
      $set: {
        username: username,
        phone: phone,
      },
    };

    if (profileImage) {
      updateFields.$set.profileImage = profileImage.filename;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.session.email },
      updateFields,
      { new: true }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const LoadAdress = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;

    const cartData = await Cart.findOne({ User: userId }).populate(
      "Items.Products"
    );
    const userData = await User.findOne({ _id: userId });

    res.render("../views/user/address", { cartData, userData });
  } catch (error) {
    console.log(error);
  }
};

// adding address-------------------------------------------------------------------------
const AddAdress = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    const userId = user._id;

    const shippingName = req.body.shippingName;
    const Phone = req.body.phone;
    const City = req.body.city;
    const State = req.body.state;
    const Country = req.body.country;
    const Pincode = req.body.pincode;

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          address: {
            shippingName: shippingName,
            phone: Phone,
            city: City,
            state: State,
            country: Country,
            pincode: Pincode,
          },
        },
      }
    );
    res.redirect("/address");
  } catch (error) {
    console.log(error);
  }
};

const editAdress = async (req, res) => {
  try {
    const addressId = req.query._id;
    const shippingName = req.body.shippingName;
    const phone = req.body.phone;
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;
    const pincode = req.body.pincode;

    const userData = await User.findOne({ email: req.session.email });

    if (
      !addressId ||
      !shippingName ||
      !phone ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      return res.redirect("/address");
    }
    const address = userData.address.id(addressId);

    address.shippingName = shippingName;
    address.phone = phone;
    address.city = city;
    address.state = state;
    address.country = country;
    address.pincode = pincode;

    await userData.save();

    res.redirect("/address");
  } catch (error) {
    console.log(error.message);
  }
};

// Delete address -------------------------------------------------------------------------------
const DeleteuserAddress = async (req, res) => {
  try {
    const useremail = await User.findOne({ email: req.session.email });
    const userId = useremail._id;

    const addressId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Load wallet --------------------------------------------
const LoadWallet = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.session.email});
    userData.Activity.sort((a, b) => b.Date - a.Date);
    res.render("../views/user/wallet.ejs", { userData });
  } catch (error) {
    console.log(error);
  }
};

//LogoutUser

const LogoutUser = async (req, res) => {
  try {
    req.session.logged = false;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadSignup,
  landingload,
  signupUser,
  loadLogin,
  loginUser,
  loadHome,
  otpverify,
  LoadOTP,
  otpSender,
  LogoutUser,
  LoadUserProfile,
  LoadeditProfile,
  editUserProfile,
  LoadAdress,
  AddAdress,
  editAdress,
  DeleteuserAddress,
  LoadWallet,
};
