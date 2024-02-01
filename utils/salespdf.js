const ejs = require('ejs');
const fs = require('fs');
const exceljs = require('exceljs');
const dateFns = require('date-fns');
const puppeteer = require('puppeteer');




module.exports = {
    downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
        const formattedStartDate = dateFns.format(new Date(startDate), 'yyyy-MM-dd');
        const formattedEndDate = dateFns.format(new Date(endDate), 'yyyy-MM-dd');

        
        
      try {
        const totalAmount = parseInt(totalSales)
        const template = fs.readFileSync('./utils/salesreportpdftemplate.ejs', 'utf-8');
        const html = ejs.render(template, { orders, startDate, endDate, totalAmount });
        if (format === 'pdf') {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          
          await page.setContent(html);
          
          const pdfOptions = {
              format: 'Letter',
              path: `public/sr-pdf/sales-report-${formattedStartDate}-${formattedEndDate}.pdf`,
          };
          
          await page.pdf(pdfOptions);
          await browser.close();
          res.status(200).download(pdfOptions.path);
        } else if (format === 'excel') {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Sales Report');
  
          worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Total Amount', key: 'totalamount', width: 25 },
            { header: 'Payment Method', key: 'paymentmethod', width: 25 },
          ];
  
          let totalSalesAmount = 0;
  
          orders.forEach(order => {
              worksheet.addRow({
                orderId: order.orderNumber,
                date: order.OrderDate ? new Date(order.OrderDate).toLocaleDateString() : '',
                totalamount: order.TotalPrice !== undefined ? order.TotalPrice.toFixed(2) : '',
                paymentmethod: order.paymentMethod,
              });

             
              totalSalesAmount += order.TotalPrice !== undefined ? order.TotalPrice : 0;
            });
        
        const browser = await puppeteer.launch({ headless: "new" });
  
          
          worksheet.addRow({ totalamount: 'Total Sales Amount', paymentmethod: totalSalesAmount.toFixed(2) });
  
          const excelFilePath = 'public/sr-excel/sales-report-${formattedStartDate}-${formattedEndDate}.xlsx';
          await workbook.xlsx.writeFile(excelFilePath);

          await browser.close();  
  
          res.status(200).download(excelFilePath);
        } else {
            res.status(400).send('Invalid download format');
        }
      } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
      }
    },
};





