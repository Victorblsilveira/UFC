var img = new Image();
var ctx;
var canvas;


window.onload = function(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
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

function reset(){
	ctx.drawImage(img, 0, 0);
}

function applyFilter(filter) {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	for (var i = 0; i < pix.length; i+=4) {
		filter(pix, i);
	}
	ctx.putImageData(imgd, 0, 0)
}

var grayscale = function(pixels, i) {
	mean = (pixels[i] + pixels[i+1] + pixels[i+2])/3
	pixels[i] = mean
	pixels[i+1] = mean 
	pixels[i+2] = mean
}

function potenc(){console.log('potencia');}
function negative(){console.log('negativo');}
function potenc_inv(){console.log('raiz quadrada');}
function log(){console.log('log');}
function subtract(){console.log('subtract');}

