



function addToCart(e, productId) {
    e.stopPropagation();
  
    fetch('/addtocart', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    })
    .then(response => response.json())
    .then(res => {
      if (res.status) {
        (function () {
          Toastify({
            text: res.message,
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
            onClick: function () { }
          }).showToast();
        })();
      } else {
        (function () {
          Toastify({
            text: res.message,
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
            onClick: function () { }
          }).showToast();
        })();
      }
    });
  }
  


  function updatequantity(productId, stock, change) {
    const productPrice = parseInt(document.getElementById(`Price_${productId}`).textContent, 10);
    let currentTotal = parseInt(document.getElementById("total").textContent, 10);
  
    const currentQuantityElement = document.getElementById(`number_${productId}`);
    const currentQuantity = parseInt(currentQuantityElement.value, 10);
  
    const newQuantity = currentQuantity + change;
  
    // Ensure the new quantity is within the valid range (1 to stock)
    if (newQuantity < 1 || newQuantity > stock) {
      // Show toastify message for out of stock or invalid quantity
      (function () {
        Toastify({
          text: newQuantity < 1 ? "Quantity cannot be less than 1" : "Product out of stock",
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
          onClick: function () { }
        }).showToast();
      })();
      return; // Stop further processing if the new quantity is invalid
    }
  
    const Subtotaldisplay = newQuantity * productPrice;
    const subtotalelement = document.getElementById(`Subtotal_${productId}`);
    const cartTotal_subtotalelement = document.getElementById(`cartTotal-Subtotal`);
    const totaldiv = document.getElementById("total");
    subtotalelement.textContent = `${Subtotaldisplay}/-`;
  
    fetch(`/updatequantity/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newQuantity }),
    })
    .then((response) => response.json())
    .then((res) => {
      if (res.status) {
        if (change == 1) {
          totaldiv.textContent = Number(currentTotal) + Number(productPrice);
          cartTotal_subtotalelement.textContent = Number(currentTotal) + Number(productPrice);
        } else {
          totaldiv.textContent = Number(currentTotal) - Number(productPrice);
          let subTotalcart = Number(currentTotal) - Number(productPrice);
          cartTotal_subtotalelement.textContent = `${subTotalcart}/-`;
        }
  
        currentQuantityElement.value = newQuantity;
  
        const updatedCart = res.updatedCart;
        document.getElementById("cartTotal-Subtotal").textContent = `${updatedCart.TotalAmount}/-`;
      } else {
        console.log('Error updating quantity');
      }
    });
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


