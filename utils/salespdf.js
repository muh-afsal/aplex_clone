const fs = require('fs');
const exceljs = require('exceljs');
const dateFns = require('date-fns');
const PDFDocument = require('pdfkit');

module.exports = {
    downloadReport: async (req, res, orders, startDate, endDate, totalSales, format) => {
        const formattedStartDate = dateFns.format(new Date(startDate), 'yyyy-MM-dd');
        const formattedEndDate = dateFns.format(new Date(endDate), 'yyyy-MM-dd');

        try {
            const totalAmount = parseInt(totalSales);

            if (format === 'pdf') {
                const pdfDoc = new PDFDocument();
                res.setHeader('Content-Disposition', `attachment; filename="sales-report-${formattedStartDate}-${formattedEndDate}.pdf"`);
                pdfDoc.pipe(res);

                // Add your PDF content here using pdfDoc
                pdfDoc.text(`Sales Report from ${startDate} to ${endDate}`);
                orders.forEach(order => {
                    pdfDoc.text(`Order ID: ${order.orderNumber}`);
                    pdfDoc.text(`Date: ${order.OrderDate ? new Date(order.OrderDate).toLocaleDateString() : ''}`);
                    pdfDoc.text(`Total Amount: ${order.TotalPrice !== undefined ? order.TotalPrice.toFixed(2) : ''}`);
                    pdfDoc.text(`Payment Method: ${order.paymentMethod}`);
                    pdfDoc.moveDown(); // Move to the next line
                });

                pdfDoc.text(`Total Sales Amount: ${totalAmount.toFixed(2)}`);

                pdfDoc.end();
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
                return;
            }
        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).send('Internal Server Error', error);
            return;
        }
    },
};
