

//navbar
$(document).ready(function () {
    const mobileMenu = $('.nav__mobile');
    const navList = $('.nav__list');
    const navBar = $('.nav'); // The navbar container
    const navLinks = $('.nav__list--link a');
    let isMenuOpen = false; // Track menu state

    // Toggle the menu with slide effect when mobile menu is clicked
    mobileMenu.on('click', function (e) {
        e.preventDefault(); // Prevent default action of the link

        // Calculate the navbar's height dynamically
        const navBarHeight = navBar.outerHeight();
        navList.css({
            top: navBarHeight + 'px', // Position menu below the navbar
            position: 'absolute', // Ensure it stays below the navbar
            width: '100%', // Stretch menu to full width
        });

        // Toggle the menu with slide effect
        navList.slideToggle(300, function () {
            isMenuOpen = $(this).is(':visible'); // Update state after animation
        });
    });

    // Close the menu when clicking outside of it
    $(document).on('click', function (e) {
        if (isMenuOpen && !$(e.target).closest('.nav').length) {
            navList.slideUp(300, function () {
                isMenuOpen = false; // Update state after closing
            });
        }
    });

    // Close the menu when clicking on a link
    navLinks.on('click', function () {
        if (isMenuOpen) {
            navList.slideUp(300, function () {
                isMenuOpen = false; // Update state after closing
            });
        }
    });
});




//upload
document.addEventListener("DOMContentLoaded", () => {
    const canvasContainer = document.getElementById("canvas_box");
    const canvas = new fabric.Canvas("canvas", {
        width: canvasContainer.clientWidth,
        height: canvasContainer.clientHeight,
        backgroundColor: null
    });
    

    
    const uploadInput = document.getElementById("inputupload");
    const flipButton = document.getElementById("btn_flip");
    const exportButton = document.getElementById("btn_export");

    let overlayImage, backgroundImage;
    let originalImageWidth, originalImageHeight;
    let currentZoom = 1; // Store the current zoom level
    let overlayImageOriginalWidth; // Store the overlay image's original width

    // Function to set the overlay image as the active object
    const selectOverlayImage = () => {
        if (overlayImage) {
            canvas.setActiveObject(overlayImage);
            canvas.renderAll();
        }
    };

    // Function to rescale and reposition the overlay image
    const updateOverlayImage = () => {
        if (overlayImage) {
            // Calculate the new scale based on the overlay image's original width
            const initialWidth = 250;
            const scale = (initialWidth / overlayImageOriginalWidth) * (canvas.getWidth() / canvasContainer.clientWidth);

            // Calculate the new position to center the overlay image horizontally
            const left = (canvas.getWidth() - initialWidth * (canvas.getWidth() / canvasContainer.clientWidth)) / 2;

            // Calculate the new top position based on the new aspect ratio
            const top = 100 * (canvas.getHeight() / canvasContainer.clientHeight);

            overlayImage.set({
                left: left,
                top: top,
                scaleX: scale,
                scaleY: scale,
            });

            canvas.renderAll();
        }
    };

    // Step 1: Upload Background Image
    uploadInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    // Resize the image if its width exceeds 800px
                    const maxWidth = 800;
                    let newWidth = img.width;
                    let newHeight = img.height;
    
                    if (img.width > maxWidth) {
                        newWidth = maxWidth;
                        newHeight = (img.height * maxWidth) / img.width; // Maintain aspect ratio
                    }
    
                    // Create a temporary canvas to resize the image
                    const tempCanvas = document.createElement("canvas");
                    const tempCtx = tempCanvas.getContext("2d");
                    tempCanvas.width = newWidth;
                    tempCanvas.height = newHeight;
                    tempCtx.drawImage(img, 0, 0, newWidth, newHeight);
    
                    // Get the resized image as a data URL
                    const resizedImageUrl = tempCanvas.toDataURL("image/png");
    
                    // Load the resized image into Fabric.js
                    const resizedImg = new Image();
                    resizedImg.src = resizedImageUrl;
                    resizedImg.onload = () => {
                        // Store original dimensions (of the resized image)
                        originalImageWidth = resizedImg.width;
                        originalImageHeight = resizedImg.height;
    
                        // Remove existing background image if any
                        if (backgroundImage) {
                            canvas.remove(backgroundImage);
                        }
    
                        // Set canvas internal dimensions to match the resized image
                        canvas.setDimensions({
                            width: resizedImg.width,
                            height: resizedImg.height,
                        });
    
                        // Scale and center the canvas content
                        const scaleX = canvasContainer.clientWidth / resizedImg.width;
                        const scaleY = canvasContainer.clientHeight / resizedImg.height;
                        currentZoom = Math.min(scaleX, scaleY);
                        canvas.setZoom(currentZoom);
                        canvas.viewportTransform[4] = (canvasContainer.clientWidth - resizedImg.width * currentZoom) / 2;
                        canvas.viewportTransform[5] = (canvasContainer.clientHeight - resizedImg.height * currentZoom) / 2;
                        canvas.viewportTransform[5] = 0;
                        
                        // Add the resized image as a non-interactive background
                        backgroundImage = new fabric.Image(resizedImg, {
                            left: 0, top: 0, scaleX: 1, scaleY: 1,
                            selectable: false, evented: false,
                            hasControls: false, hasBorders: false,
                            lockMovementX: true, lockMovementY: true,
                        });
                        canvas.add(backgroundImage);
                        canvas.sendToBack(backgroundImage);
    
                        // Rescale and reposition the overlay image
                        updateOverlayImage();
    
                        // Ensure the overlay image is selected
                        selectOverlayImage();
                        
   
                        $('#btn_save, #btn_flip, #btn_reset,#btn_export').removeClass("hidden");
                        $('#btn_add').addClass("hidden");
                        
                    };
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // Step 2: Add Overlay Image
    const overlayImageUrl = "images/upload-eyes.png?v=2";
    
    fabric.Image.fromURL(overlayImageUrl, (img) => {
        // Store the overlay image's original width
        overlayImageOriginalWidth = img.width;
    
        // Define the base width for the overlay image (250px at 600px container width)
        const baseContainerWidth = 600;
        const baseOverlayWidth = 250;
        const baseTopPosition = 100; // Base top position at 600px container width
    
        // Calculate the scale factor based on the current container width
        const scaleFactor = canvasContainer.clientWidth / baseContainerWidth;
    
        // Calculate the initial width of the overlay image
        const initialWidth = baseOverlayWidth * scaleFactor;
    
        // Calculate the scale to make the overlay image the desired width
        const scale = initialWidth / img.width;
    
        // Calculate the left position to center the overlay image horizontally
        const left = (canvas.getWidth() - initialWidth) / 2;
    
        // Calculate the top position proportionally
        const top = baseTopPosition * scaleFactor;
    
        img.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            hasControls: true, // Enable controls
            hasBorders: true, // Enable borders
            lockScalingFlip: true, // Prevent flipping while scaling
        });
    
        img.on("scaling", (e) => img.scaleY = img.scaleX); // Enforce uniform scaling
        canvas.add(img);
        overlayImage = img;
    
        // Ensure the overlay image is selected
        selectOverlayImage();
    });

    // Step 3: Flip Overlay Image
    flipButton.addEventListener("click", () => {
        if (overlayImage) {
            overlayImage.set("flipX", !overlayImage.flipX);
            canvas.renderAll();
        }
    });

    // Step 4: Export Merged Image
    exportButton.addEventListener("click", () => {
        if (!backgroundImage || !overlayImage) {
            alert("Please upload a background image first.");
            return;
        }

        // Temporarily reset the zoom and viewport for export
        canvas.setZoom(1);
        canvas.viewportTransform[4] = 0;
        canvas.viewportTransform[5] = 0;

        // Export the canvas at its original high resolution
        const dataURL = canvas.toDataURL({
            format: "png",
            quality: 1,
        });

        // Restore the zoom and viewport
        canvas.setZoom(currentZoom);
        canvas.viewportTransform[4] = (canvasContainer.clientWidth - originalImageWidth * currentZoom) / 2;
        canvas.viewportTransform[5] = (canvasContainer.clientHeight - originalImageHeight * currentZoom) / 2;
        canvas.viewportTransform[5] = 0;

        // Download the exported image
        saveAs(dataURL, "Yami.png");
    });

    // Ensure the overlay image is selected whenever the canvas is interacted with
    canvas.on("object:selected", (e) => {
        if (e.target !== overlayImage) {
            selectOverlayImage();
        }
    });

    canvas.on("object:moving", (e) => {
        if (e.target !== overlayImage) {
            selectOverlayImage();
        }
    });

    canvas.on("object:scaling", (e) => {
        if (e.target !== overlayImage) {
            selectOverlayImage();
        }
    });
    
    
    // Step 5: Reset Canvas
    const resetButton = document.getElementById("btn_reset");
    resetButton.addEventListener("click", () => {
        // Remove the uploaded background image
        if (backgroundImage) {
            canvas.remove(backgroundImage);
            backgroundImage = null;
        }
        
        
        // Reset the canvas dimensions to match the container size
        canvas.setDimensions({
            width: canvasContainer.clientWidth,
            height: canvasContainer.clientHeight,
        });
        
        // Reset the zoom and viewport
        currentZoom = 1;
        canvas.setZoom(currentZoom);
        canvas.viewportTransform[4] = 0;
        canvas.viewportTransform[5] = 0;
    
        // Reset the overlay image (eyes) position and rotation
        if (overlayImage) {
            // Define the base width for the overlay image (250px at 600px container width)
            const baseContainerWidth = 600;
            const baseOverlayWidth = 250;
            const baseTopPosition = 100; // Base top position at 600px container width
    
            // Calculate the scale factor based on the current container width
            const scaleFactor = canvasContainer.clientWidth / baseContainerWidth;
    
            // Calculate the initial width of the overlay image
            const initialWidth = baseOverlayWidth * scaleFactor;
    
            // Calculate the scale to make the overlay image the desired width
            const scale = initialWidth / overlayImageOriginalWidth;
    
            // Calculate the left position to center the overlay image horizontally
            const left = (canvas.getWidth() - initialWidth) / 2;
    
            // Calculate the top position proportionally
            const top = baseTopPosition * scaleFactor;
    
            // Reset the overlay image properties
            overlayImage.set({
                left: left,
                top: top,
                scaleX: scale,
                scaleY: scale,
                flipX: false, // Reset flip (rotation)
                angle: 0, // Reset rotation angle
            });
    
            // Ensure the overlay image is selected
            selectOverlayImage();
    
            // Render the canvas to apply changes
            canvas.renderAll();
        }
    
        // Hide the save, flip, and reset buttons, and show the add image button

        $('#btn_save, #btn_flip, #btn_reset,#btn_export').addClass("hidden");
        $('#btn_add').removeClass("hidden");
    });
    
});

$(document).ready(function () {

function copyStringToClipboard(str) {
    navigator.clipboard.writeText(str).then(function() {
        alert('Copied to clipboard!');
        dialog1.close();
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
    });
}



const dialog1 = document.querySelector("#modal1");

// Select all "open modal" buttons
$('.js-address').on('click', function(e){
    e.preventDefault();
    dialog1.showModal();
})

$('.js-copy').on('click', function(e){
    e.preventDefault();
    
    copyStringToClipboard('HhCLbkW6FwhriTkk81W8tYstsRCLUu6Y7Je1SQjVpump');
    
    
});



const closeButton1 = document.querySelector("#close-modal1");
closeButton1.addEventListener("click", () => {
    dialog1.close();
});


const modal2 = document.querySelector("#modal2");

// Select all "open modal" buttons
$('.modal2').on('click', function(e){
    e.preventDefault();
    modal2.showModal();
})

const closeButton2 = document.querySelector("#close-modal2");
closeButton2.addEventListener("click", () => {
    modal2.close();
});

const modal3 = document.querySelector("#modal3");

// Select all "open modal" buttons
$('.modal3').on('click', function(e){
    e.preventDefault();
    modal3.showModal();
})

const closeButton3 = document.querySelector("#close-modal3");
closeButton3.addEventListener("click", () => {
    modal3.close();
});
});



const swiper = new Swiper('.world__slider', {
    loop: true,
    spaceBetween: 50,
    slidesPerView: 1.5,
    centeredSlides: true,
    autoplay: {
        delay: 3000, // Slide changes every 5 seconds
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
    },
    breakpoints: {
        768: { slidesPerView: 3 },
    }
});
// Remove controls from all videos on load
document.querySelectorAll('.world__slider__item__video video').forEach(video => {
    video.removeAttribute('controls');
    video.style.pointerEvents = 'none'; // Prevent clicking on the video
});

// Play video on custom button click
document.querySelectorAll('.world__slider__item__video__play').forEach(button => {
    button.addEventListener('click', function () {
        let video = this.previousElementSibling; // Get the video element
        video.play();
        video.muted = false; // Unmute video on play
        video.setAttribute('controls', ''); // Add controls when playing
        video.style.pointerEvents = 'auto'; // Enable clicking on video when playing
        this.style.display = 'none'; // Hide play button while playing
    });
});

// Pause video on click and remove controls again
document.querySelectorAll('.world__slider__item__video video').forEach(video => {
    video.addEventListener('click', function () {
        if (!this.paused) {
            this.pause();
            this.removeAttribute('controls'); // Remove controls when paused
            this.style.pointerEvents = 'none'; // Disable clicking on video when paused
            this.parentElement.querySelector('.world__slider__item__video__play').style.display = 'block';
        }
    });
});

// Pause videos when changing slides
swiper.on('slideChange', () => {
    document.querySelectorAll('.world__slider__item__video video').forEach(video => {
        video.pause();
        video.currentTime = 0;
        video.removeAttribute('controls'); // Remove controls when slide changes
        video.style.pointerEvents = 'none'; // Disable clicking on video when paused
        video.parentElement.querySelector('.world__slider__item__video__play').style.display = 'block';
    });
});


const swiper2 = new Swiper('.frame__slider', {
    loop: true,
    spaceBetween: 50,
    slidesPerView: 1.5,
    centeredSlides: true,
    autoplay: {
        delay: 3000, // Slide changes every 5 seconds
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
    },
    breakpoints: {
        768: { slidesPerView: 5 },
    }
});


const swiper3 = new Swiper('.blog__slider', {
    loop: true,
    spaceBetween: 10,
    slidesPerView: 1.5,
    centeredSlides: true,
    breakpoints: {
        1440: { slidesPerView: 3,spaceBetween: 50,},
    }
});