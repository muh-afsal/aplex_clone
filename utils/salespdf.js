const ejs = require('ejs');
const fs = require('fs');
const exceljs = require('exceljs');
const dateFns = require('date-fns');
const pdf = require('html-pdf');
const { generateTemplate } = require('./template');

module.exports = {
    downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
        const formattedStartDate = dateFns.format(new Date(startDate), 'yyyy-MM-dd');
        const formattedEndDate = dateFns.format(new Date(endDate), 'yyyy-MM-dd');

        try {
            const totalAmount = parseInt(totalSales);

            const html = generateTemplate(orders, startDate, endDate, totalAmount);

            if (format === 'pdf') {
                const pdfOptions = {
                    format: 'Letter',
                    orientation: 'portrait',
                    border: '10mm',
                    timeout: 60000, // Increase the timeout if needed
                };

                pdf.create(html, pdfOptions).toFile((err, pdfPath) => {
                    if (err) {
                        console.error('Error generating PDF:', err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.status(200).download(pdfPath.filename);
                    }
                });
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

                worksheet.addRow({ totalamount: 'Total Sales Amount', paymentmethod: totalSalesAmount.toFixed(2) });

                const excelFilePath = `public/sr-excel/sales-report-${formattedStartDate}-${formattedEndDate}.xlsx`;
                await workbook.xlsx.writeFile(excelFilePath);

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
