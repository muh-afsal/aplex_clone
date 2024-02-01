window.addEventListener('load',()=>{
    var options = {
        width: 400,
        zoomWidth: 500,
        offset: {vertical: 20, horizontal: 40}
    };
    new ImageZoom(document.getElementById("img-container"), options);
})
function showPrviewinDetail(displayTag, srcImage) {
  let imageDisplay = document.getElementById(displayTag);
  let mainSrc = imageDisplay.src;
  let imageToDisplay = document.getElementById(srcImage);

  imageDisplay.src = imageToDisplay.src;
  imageToDisplay.src = mainSrc;

  // Find the index of the clicked image
  let selectedIndex =
    Array.from(imageToDisplay.parentNode.children).indexOf(imageToDisplay) + 1;

  // Update the img-showcase to display the selected image
  let showcase = document.querySelector(".img-showcase");
  showcase.style.transform = `translateX(-${(selectedIndex - 1) * 100}%)`;

  var options = {
    width: 400,
    zoomWidth: 500,
    offset: { vertical: 20, horizontal: 40 },
  };
  new ImageZoom(document.getElementById("img-container"), options);
}

