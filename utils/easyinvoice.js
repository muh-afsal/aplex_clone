const fs = require('fs');
const path = require('path');
const easyinvoice = require('easyinvoice');



module.exports = {
    generateInvoice: async (orderDetails) => {

        const orderDate =  orderDetails.OrderDate;
const parsedDate = new Date(orderDate);

const year = parsedDate.getFullYear().toString().slice(-2);
const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
const day = parsedDate.getDate().toString().padStart(2, "0");

const formattedDate = `${year}/${month}/${day}`;

console.log(formattedDate);

        try {
            var data = {
                
                "customize": {
                   
                },
    
                "images": {
                  
                    "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'aplexlogosearch.png'), 'base64'),
                   
    
                },
                "sender": {
                    "company": "Aplex Store",
                    "address": "Emirate",
                    "zip": "673001",
                    "city": "Fujairah",
                    "country": "UAE"
                },
               

                "client": {
                    "company": orderDetails.Address.shippingName,
                    "address": orderDetails.Address.shippingName+orderDetails.Address.city,
                    "zip":orderDetails.Address.pincode ,
                    "city": orderDetails.Address.city,
                    "state":orderDetails.Address.state,
                    "Mob No": orderDetails.Address.phone
                },
                "information": {
                    "Order ID": orderDetails._id,
                    "date": formattedDate,
                    "invoice date": formattedDate,
                },
                "products": (orderDetails.Items && orderDetails.Items.length > 0) ? orderDetails.Items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productId.Name, 
                    "tax-rate": 18,
                    "price": product.Price
                })) : [],   
         
               
    
                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "INR",
                    "tax-notation": "vat",
                    "currency": "INR",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },
    
          
        }

            const result = await easyinvoice.createInvoice(data);

            const filePath = path.join(__dirname, "..", "public", "pdf", `${orderDetails._id}.pdf`);

            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};




