const bcrypt = require("bcrypt");
const session = require("express-session");
const { ObjectId } = require("mongodb");
const User = require("../model/collections/usermodel");
const Admin = require("../model/collections/adminmodel");
const order = require("../model/collections/ordermodel");
const moment=require("moment")
// Load admin login
const loadAdminLogin = async (req, res) => {

  try {
    if (req.session && req.session.adminAuth) {
      res.redirect("/admin/admin");
    } else {
    
      if (req.session && req.session.logged) {
        const admin = await Admin.findOne({ email: req.session.email });
        if (admin) {
          res.redirect("/admin"); 
        }
      } else {
        res.render("../views/admin/adminlogin");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Admin login
const loginAdmin = async (req, res) => {

  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const adminExists = await Admin.findOne({ email: email });
    if (adminExists) {
      const passwordMatch = adminExists.password === password;

      if (passwordMatch) {
        req.session.adminAuth = true;
        req.session.email = email;
        res.redirect("/admin/admin"); 
      } else {
        res.render("../views/admin/adminlogin", {
          message: "Incorrect Username or Password",
        });
      }
    } else {
      res.render("../views/admin/adminlogin", { message: "Admin not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Load admin dash
const LoadAdminDash = async (req, res) => {
  try {
    res.render("../views/admin/admindash");
  } catch (error) {
    console.log(error.message);
  }
};

//manageuser

const manageUser = async (req, res) => {
  try {
    const userData = await User.find({ isAdmin: false }).sort({ date: -1 });
    res.render("../views/admin/manageuser", { userData });
  } catch (error) {
    console.log(error.message);
  }
};

// In your router or controller file
const blockUnblockUser = async (req, res) => {
  try {
    const { id, access } = req.body;

    const result = await User.findByIdAndUpdate(id, { access });

    // Redirect back to the original page
    res.redirect("/admin/manageuser");
  } catch (error) {
    console.error(`Error updating user access: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};





//admin dash days cfiltering 
const getCount=async(req,res)=>{
  try {
    const orders = await order.find({Status:"Delivered"});

    const orderCountsByDay = {};
    const totalAmountByDay = {};
    const orderCountsByMonthYear = {};
    const totalAmountByMonthYear = {};
    const orderCountsByYear = {};
    const totalAmountByYear = {};
    let labelsByCount;
    let labelsByAmount;
    orders.forEach((orders) => {

      const orderDate = moment(orders.OrderDate, "M/D/YYYY, h:mm:ss A");
      const dayMonthYear = orderDate.format("YYYY-MM-DD");
      const monthYear = orderDate.format("YYYY-MM");
      const year = orderDate.format("YYYY");
      
      if (req.url === "/count-orders-by-day") {
       
        if (!orderCountsByDay[dayMonthYear]) {
          orderCountsByDay[dayMonthYear] = 1;
          totalAmountByDay[dayMonthYear] = orders.TotalPrice
         
        } else {
          orderCountsByDay[dayMonthYear]++;
          totalAmountByDay[dayMonthYear] += orders.TotalPrice
        }
        
        const ordersByDay = Object.keys(orderCountsByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            count: orderCountsByDay[dayMonthYear],
          })
        );
     

        const amountsByDay = Object.keys(totalAmountByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            total: totalAmountByDay[dayMonthYear],
          })
        );
        

        amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
        ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

       

        labelsByCount = ordersByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        labelsByAmount = amountsByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        dataByCount = ordersByDay.map((entry) => entry.count);
        dataByAmount = amountsByDay.map((entry) => entry.total);

       

      } else if (req.url === "/count-orders-by-month") {
        if (!orderCountsByMonthYear[monthYear]) {
          orderCountsByMonthYear[monthYear] = 1;
          totalAmountByMonthYear[monthYear] = orders.TotalPrice;
        } else {
          orderCountsByMonthYear[monthYear]++;
          totalAmountByMonthYear[monthYear] += orders.TotalPrice;
        }
      
        const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            count: orderCountsByMonthYear[monthYear],
          })
        );
        const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            total: totalAmountByMonthYear[monthYear],
          })
          
        );
       
      
        ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
        labelsByAmount = amountsByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
        dataByCount = ordersByMonth.map((entry) => entry.count);
        dataByAmount = amountsByMonth.map((entry) => entry.total);
      } else if (req.url === "/count-orders-by-year") {
        if (!orderCountsByYear[year]) {
          orderCountsByYear[year] = 1;
          totalAmountByYear[year] = orders.TotalPrice;
        } else {
          orderCountsByYear[year]++;
          totalAmountByYear[year] += orders.TotalPrice;
        }
        const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
          _id: year,
          count: orderCountsByYear[year],
        }));
        const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
          _id: year,
          total: totalAmountByYear[year],
        }));
      
        ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByYear.map((entry) => entry._id);
        labelsByAmount = amountsByYear.map((entry) => entry._id);
        dataByCount = ordersByYear.map((entry) => entry.count);
        dataByAmount = amountsByYear.map((entry) => entry.total);
      }
    });

    res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
    
    
  } catch (error) {
    console.error("error while chart loading :",error)
  }
}







const getOrdersAndSellers=async(req,res)=>{
  try {
  
    const latestOrders = await order.find().sort({ _id: -1 }).limit(6);
  
  
    const bestSeller = await order.aggregate([
      {
        $unwind: "$Items",
      },
      {
        $group: {
          _id: "$Items.productId",
          totalCount: { $sum: "$Items.quantity" },
        },
      },
      {
        $sort: {
          totalCount: -1,
        },
      },
      {
        $limit: 6,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
    ]);
    
    if (!latestOrders || !bestSeller) throw new Error("No Data Found");
  
    res.json({ latestOrders, bestSeller });
  
  
   
  } catch (error) {
    console.log("error while fetching the order details in the dashboard",error);
  }
  }
  
  









module.exports = {
  LoadAdminDash,
  manageUser,
  blockUnblockUser,
  loginAdmin,
  loadAdminLogin,
  getCount,
  getOrdersAndSellers

};
