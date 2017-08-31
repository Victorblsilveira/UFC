
var img = new Image();

var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

document.getElementById('reset').onclick = function() {
	ctx.drawImage(img, 0, 0);
}

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

function applyFilter(filter) {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	for (var i = 0; i < pix.length; i+=4) {
		filter(pix, i);
	}
	ctx.putImageData(imgd, 0, 0)
}

document.getElementById('btn_gray').onclick = function() {
	applyFilter(grayscale);
}

var grayscale = function(pixels, i) {
	mean = (pixels[i] + pixels[i+1] + pixels[i+2])/3
	pixels[i] = mean
	pixels[i+1] = mean 
	pixels[i+2] = mean
}

