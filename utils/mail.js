const nodemailer=require("nodemailer")
const {AUTH_EMAIL,AUTH_PASS}=process.env;
require("dotenv").config()


//transporting
const mailTranspoter=nodemailer.createTransport({
    service:"gmail",
    auth:{user:AUTH_EMAIL,pass:AUTH_PASS}
})



//verifying 
mailTranspoter.verify((error,success)=>{
if(error){
    console.log(error);
}else{
    // console.log("email ready to send");
}

})



//sending mail
const sendemail=async (mailOptions)=>{
   try {
    await mailTranspoter.sendMail(mailOptions)
    console.log("email successfully sent");
    return
   } catch (error) {
    console.log(error);
   }
}

module.exports = sendemail
