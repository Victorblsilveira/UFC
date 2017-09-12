var img = new Image();
var ctx;
var canvas;
var histogram;
var histogramNormalizer;
var matriz = []
var dimension = 3;
google.charts.load("current", {packages:["corechart"]});

var options = {
    title: "Histogram",
    width: 500,
    height: 200,
    legend: { position: "none" },
};

var histo_1;
var histo_2;

var threshold = 0.5
var lambda = 1;
var constant = 25;
var bitSlicePos = 4;
var bitSliceValue = Math.pow(2, bitSlicePos);
var pointers = [0,0,0,0]

window.onload = function(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	histo_1 = new google.visualization.ColumnChart(document.getElementById('histo_1'));
	histo_2 = new google.visualization.ColumnChart(document.getElementById('histo_2'));

	createMatrix();
}

function handleImage(e){
		console.log(e);

    var reader = new FileReader();
    reader.onload = function(event){
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);

            drawHistogram(histo_1);
            drawHistogram(histo_2);
						showGraphs(true)
        }

        img.src = event.target.result;
		document.querySelector('#origin').setAttribute("src",event.target.result)
    }
    reader.readAsDataURL(e.target.files[0]);

}

function reset(){
	ctx.drawImage(img, 0, 0);
	drawHistogram(histo_2);
}

function showGraphs(option){
	if (option){
		document.getElementsByClassName("histogramas")[0].classList.remove("hide")
	}else {
		document.getElementsByClassName("histogramas")[0].classList.add("hide")
	}
}

function loadHistogram() {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	histogram = [];
	for (var i = 0; i < 256; i++) histogram[i] = [i, 0];

	for (var i = 0; i < pix.length; i+=4) {
		mean = parseInt(getMean(pix, i));
		histogram[mean][1] += 1;
	}
	histogramNormalizer = [];
	sum = pix.length/4;
	acc = 0;
	for (var i = 0; i < 256; i++) {
		acc += histogram[i][1];
		histogramNormalizer[i] = Math.round(255 * acc/sum);
	}
}

function drawHistogram(div_to_draw){
	loadHistogram();

	data = google.visualization.arrayToDataTable([["Intensity", "Quantity"]].concat(histogram))
	div_to_draw.draw(data, options);
}


function applyFilter(filter,element) {
	loadHistogram();

	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	var copy = pix.slice();

	for (var i = 0; i < pix.length; i+=4) {
		filter(copy, pix, i);
	}
	ctx.putImageData(imgd, 0, 0);
	drawHistogram(histo_2);
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


function updateLambda(element){
	val = element.target.value/2
	lambda = (val > 10) ? val - 9 : 1/(11-val);
	lambda = lambda.toFixed(2);
	document.getElementById("range_potenc").innerHTML= lambda;
}

function updateConstant(element){
	constant = element.target.value
	document.getElementById("range_log").innerHTML= constant;
}

function updateVariables(event,indexVariable){
	pointers[indexVariable] = parseInt(event.target.value);
}

function getMean(pixels, i) {
	return (pixels[i] + pixels[i+1] + pixels[i+2])/3
}

function grayscale(copy, pixels, i) {
	mean = getMean(copy, i);
	pixels[i] = pixels[i+1] = pixels[i+2] = mean;
}

function negative(copy, pixels, i) {
	pixels[i] = 255 - copy[i];
	pixels[i+1] = 255 - copy[i+1];
	pixels[i+2] = 255 - copy[i+2];
}

function potenc(copy, pixels, i) {
	mean = getMean(copy, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = Math.pow(mean, lambda) * 255;
}

function log(copy, pixels, i) {
	mean = getMean(copy, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = constant * Math.log(1+mean) * 255;
}

function inverse_log(copy, pixels, i) {
	mean = getMean(copy, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = (Math.exp(mean) - 1) / constant * 255;
}

function limiar(copy, pixels, i) {
	mean = getMean(copy, i) / 255;
	pixels[i] = pixels[i+1] = pixels[i+2] = (threshold > mean) ? 255 : 0
}

function getPoints() {
	i1 = (pointers[0] > pointers[2]) ? 2 : 0;
	i2 = 2 - i1;
	P1 = [pointers[i1], pointers[i1+1]];
	P2 = [pointers[i2], pointers[i2+1]];
	return [P1, P2];
}

function linF1(x) {
	P = getPoints()[0];
	return (P[0] != 0) ? parseInt(x * (P[1] / P[0])) : P[1];
}

function linF2(x) {
	P1 = getPoints()[0];
	P2 = getPoints()[1];
	P = [P2[0] - P1[0], P2[1] - P1[1]];
	return (P[0] != 0) ? parseInt((x - P1[0]) * (P[1] / P[0]) + P1[1]) : P2[1];
}

function linF3(x) {
	P = getPoints()[1];
	return (P[0] != 255) ? parseInt((x - P[0]) * ((255 - P[1]) / (255 - P[0])) + P[1]) : P[1];
}

function limiar_apar(copy, pixels, i){
	mean = getMean(copy, i);
	P = getPoints();
	val = (mean < P[0][0]) ? linF1(mean) : (mean > P[1][0]) ? linF3(mean) : linF2(mean);
	pixels[i] = pixels[i+1] = pixels[i+2] = val;
}

function bit_slice(copy, pixels, i) {
	mean = parseInt(getMean(copy, i));
	pixels[i] = pixels[i+1] = pixels[i+2] = ((mean & bitSliceValue) === 0) ? 0 : mean;
}

function subtract(copy, pixels, i) {
	console.log('subtract');
}

function normalizeHistogram(copy, pixels, i) {
	mean = parseInt(getMean(copy, i));
	pixels[i] = pixels[i+1] = pixels[i+2] = histogramNormalizer[mean];
}

function convolution(copy, pixels, i) {
	p = getIJFromPixel(i);
	radius = (dimension-1)/2;
	val = 0;
	for (x = 0; x < dimension; x++) {
		for (y = 0; y < dimension; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				val += getMean(copy, getPixelIndex(_i, _j)) * matriz[x][y];
			}
		}
	}
	pixels[i] = pixels[i+1] = pixels[i+2] = parseInt(val);
}

function getPixelIndex(i, j) {
	return (i*canvas.width + j) * 4;
}

function getIJFromPixel(index) {
	i = index/4;
	return [parseInt(i/canvas.width), i%canvas.width];
}

function updateDimension(event){
	dimension = parseInt(event.target.value)
}

function updateMatrix(i,j,event){
	console.log(event)
	if (matriz[parseInt(i)] == undefined){matriz[parseInt(i)] = []}
	matriz[parseInt(i)][parseInt(j)] = event.target.value
}

function createMatrix(){
	 var html = "";
	 for(var i=0;i<dimension;i++){
		 html += '<div class="colunm">'
		 for(var j=0;j<dimension;j++){
			 html +=  '<input class="cel" onchange="updateMatrix('+j+','+i+',event)" type="text">'
		 }
		 html += '</div>'
	 }
	 var matriz = document.getElementById('matriz')
	 matriz.innerHTML = html
	 matriz.value = ''
}

function localNormalizer() {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;

	for (var i = 1; i+1 < canvas.height; i+=3) {
		for (var j = 1; j+1 < canvas.width; j+=3) {
			indexes = [
				getPixelIndex(i-1 , j-1),
				getPixelIndex(i-1 ,  j ),
				getPixelIndex(i-1 , j+1),
				getPixelIndex( i  , j-1),
				getPixelIndex( i  ,  j ),
				getPixelIndex( i  , j+1),
				getPixelIndex(i+1 , j-1),
				getPixelIndex(i+1 ,  j ),
				getPixelIndex(i+1 , j+1),
			];
			vec = {};
			for (k in indexes) vec[indexes[k]] = parseInt(getMean(pix, indexes[k]));

			miniHist = {};

			for (k in vec) {
				if (!(vec[k] in miniHist)) miniHist[vec[k]] = 0;
				miniHist[vec[k]] += 1;
			}
			miniHistNormalizer = {};
			acc = 0;
			for (k in miniHist) {
				acc += miniHist[k];
				miniHistNormalizer[k] = Math.round(255 * acc/9);
			}

			for (k in indexes) {
				pix[indexes[k]] = pix[indexes[k]+1] = pix[indexes[k]+2] = miniHistNormalizer[vec[indexes[k]]];
			}

		}
	}

	ctx.putImageData(imgd, 0, 0);
	drawHistogram(histo_2);

}
