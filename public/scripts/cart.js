



function addToCart(e, productId) {
    e.stopPropagation();

    fetch('/addtocart', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
    })
        .then(response => response.json())
        .then(res => {
            // if (res.success) {
            //     (function() {
            //         Toastify({
            //           text: "Product Out of Stock!",
            //           duration: 2000,
            //           newWindow: true,
            //           close: true,
            //           gravity: "to", 
            //           position: "center", 
            //           stopOnFocus: true,
            //           style: {
            //             background: "#52b963",
            //             borderRadius: "8px"
                        
            //           },
            //           onClick: function(){} 
            //         }).showToast();
            //       })();
            // }
        
            if (res.status) {
                (function() {
                    Toastify({
                      text: "Product Added to Cart",
                      duration: 2000,
                      newWindow: true,
                      close: true,
                      gravity: "to", 
                      position: "center", 
                      stopOnFocus: true,
                      style: {
                        background: "#52b963",
                        borderRadius: "8px"
                        
                      },
                      onClick: function(){} 
                    }).showToast();
                  })();
            } else {
                (function() {
                    Toastify({
                      text: "Product Out of Stock,or Error while Product Adding!",
                      duration: 2000,
                      newWindow: true,
                      close: true,
                      gravity: "to", 
                      position: "center", 
                      stopOnFocus: true,
                      style: {
                        background: "#FF0000",
                        borderRadius: "8px"
                        
                      },
                      onClick: function(){} 
                    }).showToast();
                  })();
            }
        })

}


function updatequantity(productId, stock, change) {
    const productPrice = parseInt(document.getElementById(`Price_${productId}`).textContent, 10);

    const newQuantity = parseInt(document.getElementById(`number_${productId}`).value, 10) + change;
    if (newQuantity <= stock && newQuantity >= 1) {

        const Subtotaldisplay = newQuantity * productPrice;

        const subtotalelement = document.getElementById(`Subtotal_${productId}`);
        const cartTotal_subtotalelement = document.getElementById(`cartTotal-Subtotal`);
        subtotalelement.textContent = `${Subtotaldisplay}/-`;

        let currentTotal = document.getElementById("total").textContent;
        if (change == 1) {
            document.getElementById("total").textContent = Number(currentTotal) + Number(productPrice);
            cartTotal_subtotalelement.textContent = Number(currentTotal) + Number(productPrice);
        } else {
            document.getElementById("total").textContent = Number(currentTotal) - Number(productPrice);
            let subTotalcart = Number(currentTotal) - Number(productPrice);
            cartTotal_subtotalelement.textContent = `${subTotalcart}/-`;
        }

        fetch(`/updatequantity/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newQuantity }),
        })
            .then((response) => response.json())
            .then((res) => {
                if (res.status) {
                    document.getElementById(`number_${productId}`).value = newQuantity;
                } else {
                    console.log('Error updating quantity');
                }
            });
    }
}

function removeProduct(productId,rowId,rowtoremove) {    
   
        fetch(`/removeproduct/${productId}/${rowId}/${rowtoremove}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(res => {
                if (res.status) {
                    document.getElementById(rowtoremove).style.display = 'none';
                    let currentCount=localStorage.getItem("cartcount")
                    localStorage.setItem("cartcount",currentCount-1)

                    if(localStorage.getItem("cartcount")<=0){
                        window.location.reload()
                    }
                
                     const productPrice=parseInt( document.getElementById(`Subtotal_${productId}`).textContent)
                     let totalamount=parseInt(document.getElementById(`total`).textContent)
                     let totalamountelement=document.getElementById(`total`)
                     let totalAmountChange=totalamount-productPrice
                     totalamountelement.textContent=totalAmountChange


                } else {
                   
                    (function() {
                        Toastify({
                          text: "Error while removing Product...!",
                          duration: 2000,
                          newWindow: true,
                          close: true,
                          gravity: "bottom",
                          position: "center", 
                          stopOnFocus: true,
                          style: {
                            background: "#DC143C",
                            
                          },
                          onClick: function(){} // Callback after click
                        }).showToast();
                      })();
                }
            })
              
    
}


