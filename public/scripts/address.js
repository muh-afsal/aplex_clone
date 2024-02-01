const { response } = require("express");


function addAddress(){
    fetch('/addAddress',{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify()
    })
    .then(response=>response.json())
    .then()
}