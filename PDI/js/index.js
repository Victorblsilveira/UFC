var img = new Image();
var ctx;
var originalHeight;
var originalWidth;
var canvas;
var histogram;
var histogramNormalizer;
var matriz = []
var dimension = 3;
var reductionFactor = 2;
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

function drawHistogram(div_to_draw){
	loadHistogram();

	data = google.visualization.arrayToDataTable([["Intensity", "Quantity"]].concat(histogram))
	div_to_draw.draw(data, options);
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

function updateReductionFactor(event){
	reductionFactor = parseInt(event.target.value)
}

function updateMatrix(i,j,event){
	console.log(event)
	if (matriz[i] == undefined) matriz[i] = [];
	matriz[i][j] = math.eval(event.target.value)
}