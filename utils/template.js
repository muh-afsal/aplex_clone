function generateTemplate(orders, startDate, endDate, totalAmount) {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table, th, td {
            border: 1px solid black;
        }

        th, td {
            padding: 10px;
            text-align: left;
        }
    </style>
</head>

<body>
    <div class="d-flex justify-content-center align-items-center">
        <h1 style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;">
            Sales Report From ${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            to ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </h1>
    </div>

    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Total Amount</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr>
                    <td>${order.orderNumber}</td>
                    <td>${order.OrderDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                    <td>${order.paymentMethod}</td>
                    <td>${order.TotalPrice.toFixed(2)}</td>
                </tr>`).join('')}
        </tbody>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td style="font-weight: 600;">Total Sales : </td>
            ${totalAmount
                ? `<td>₹ ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : 'N/A'}</td>`
                : `<td>No sales data</td>`
            }
        </tr>
    </table>
</body>
</html>
    `;
}

module.exports={generateTemplate}