var img = new Image();
var ctx;
var canvas;

var threshold = 0.5
var lambda = 10;
var constant = 2;
var bitSlicePos = 4;
var bitSliceValue = Math.pow(2, bitSlicePos);

window.onload = function(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
}

function handleImage(e){
		console.log(e);

    var reader = new FileReader();
    reader.onload = function(event){
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
				document.querySelector('#origin').setAttribute("src",event.target.result)
    }
    reader.readAsDataURL(e.target.files[0]);
}

function reset(){
	ctx.drawImage(img, 0, 0);
}

function applyFilter(filter,element) {

	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	for (var i = 0; i < pix.length; i+=4) {
		filter(pix, i);
	}
	ctx.putImageData(imgd, 0, 0)
}

function updateTresholdLimiar(element){
	threshold = element.target.value/1000;
	document.getElementById("range_limiar").innerHTML= threshold;
}

function updateTresholdBitSlice(element){
	bitSlicePos = element.target.value;
	bitSliceValue = Math.pow(2, bitSlicePos);
	document.getElementById("range_bitslice").innerHTML= bitSlicePos;
}

function getMean(pixels, i) {
	return (pixels[i] + pixels[i+1] + pixels[i+2])/3
}

function grayscale(pixels, i) {
	mean = getMean(pixels, i);
	pixels[i] = pixels[i+1] = pixels[i+2] = mean;
}

function negative(pixels, i) {
	pixels[i] = 255 - pixels[i];
	pixels[i+1] = 255 - pixels[i+1];
	pixels[i+2] = 255 - pixels[i+2];
}

function potenc(pixels, i) {
	mean = getMean(pixels, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = Math.pow(mean, lambda) * 255;
}

function log(pixels, i) {
	mean = getMean(pixels, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = constant * Math.log(1+mean) * 255;
}

function inverse_log(pixels, i) {
	mean = getMean(pixels, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = (Math.exp(mean) - 1) / constant * 255;
}

function limiar(pixels, i) {
	mean = getMean(pixels, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = (threshold > mean) ? 255 : 0
}

function bit_slice(pixels, i) {
	mean = parseInt(getMean(pixels, i));
	pixels[i] = pixels[i+1] = pixels[i+2] = ((mean & bitSliceValue) === 0) ? 0 : mean;
}

function subtract(pixels, i) {
	console.log('subtract');
}
