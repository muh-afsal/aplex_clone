const nodemailer = require("nodemailer");
const otpmodel = require("../model/collections/otpmodel");
require("dotenv").config();
const { AUTH_EMAIL } = process.env.AUTH_EMAIL;
const sentmail = require("../utils/mail");
// const sendemail = require("../utils/mail");

const sentOTP = async (email) => {
  try {
    if (!email) {
      throw Error("provide values for email");
    }
    //deletiing existing otp
    await otpmodel.deleteOne({ email: email });

    //generating new otp
    const generatedotp = Math.floor(Math.random() * 9000) + 1000;

    //
    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "verify the email using this OTP",
      html: `<p>Use this OTP to verify your email and continue:</p><b>${generatedotp}</b>`,
    };

    //sending otp

    await sentmail(mailOptions);
    console.log(`generated otp:${generatedotp}`);

    //saving otp

    const currentDate = new Date();
    const newDate = new Date(currentDate.getTime() + 2 * 60000);
    const newOTP = await new otpmodel({
      email,
      otp: generatedotp,
      otpAdded: currentDate,
      ExpireAt: newDate,
    });

    const createOTPrecord = await newOTP.save();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  sentOTP,
};
