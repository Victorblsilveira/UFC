$(function(){
    var bCanPreview = true; // can preview

    // create canvas and context objects
    var canvas = document.getElementById('picker');
    var ctx = canvas.getContext('2d');

    var canvas2 = document.getElementById('canvas');
    var ctx2 = canvas2.getContext('2d');

    // drawing active image
    var image = new Image();
    image.onload = function () {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // draw the image on the canvas
    }

    // select desired colorwheel
    var imagesrc="img/wheel/colorwheel1.png";
    switch ($(canvas).attr('var')) {
        case '2':
            imagesrc="img/wheel/colorwheel2.png";
            break;
        case '3':
            imagesrc="img/wheel/colorwheel3.png";
            break;
        case '4':
            imagesrc="img/wheel/colorwheel4.png";
            break;
        case '5':
            imagesrc="img/wheel/colorwheel5.png";
            break;
    }
    image.src = imagesrc;

    $('#picker').mousemove(function(e) { // mouse move handler
        if (bCanPreview) {
            // get coordinates of current position
            var canvasX = e.offsetX;
            var canvasY = e.offsetY;

            // get current pixel
            var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
            var pixel = imageData.data;

            // update preview color
            updatePreview(pixel);

            rgb = pixel;
            updateBasedOnRGB();
            // update controls
            $('#rVal').val(pixel[0]);
            $('#gVal').val(pixel[1]);
            $('#bVal').val(pixel[2]);
            $('#rgbVal').val(pixel[0]+','+pixel[1]+','+pixel[2]);

            var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
            $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
        }
    });

    $('body').click(function (e) {

        if(e.target.id == "colorpicker" || e.target.id == "preview")
            return;
        //For descendants of menu_content being clicked, remove this check if you do not want to put constraint on descendants.
        if($(e.target).closest('#colorpicker').length)
            return;    

        if ($('#colorpicker').is(':visible'))
            $('#colorpicker').fadeToggle("slow", "linear");
    });

    $('#picker').click(function(e) { // click event handler
        bCanPreview = !bCanPreview;
        $('#colorpicker').fadeToggle("slow", "linear");
    });

    $('#canvas').mousemove(function(e) { // mouse move handler
        if (bCanPreview) {
            // get coordinates of current position
            var canvasX = e.offsetX;
            var canvasY = e.offsetY;

            // get current pixel
            var imageData = ctx2.getImageData(canvasX, canvasY, 1, 1)
            var pixel = imageData.data;

            // update preview color
            updatePreview(pixel);

            rgb = pixel;
            updateBasedOnRGB();
            // update controls
            $('#rVal').val(pixel[0]);
            $('#gVal').val(pixel[1]);
            $('#bVal').val(pixel[2]);
            $('#rgbVal').val(pixel[0]+','+pixel[1]+','+pixel[2]);

            var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
            $('#hexVal').val('#' + ('0000' + dColor.toString(16)).substr(-6));
        }
    });

    $('#canvas').click(function(e) { // click event handler
        bCanPreview = !bCanPreview;
    });

    $('.preview').click(function(e) { // preview click
        $('#colorpicker').fadeToggle("slow", "linear");
        bCanPreview = true;
    });
});
