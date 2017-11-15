var img = new Image();
var img_back = new Image();
var ctx;
var canvas;

var ctx_back;
var canvas_back;

var histogram;
var histogramNormalizer;

var histogramR;
var histogramNormalizerR;
var histogramG;
var histogramNormalizerG;
var histogramB;
var histogramNormalizerB;

var dimension = 3;
var matrix = new Matrix(3);
var reductionFactor = 2;
var counterHarmonicFactor = 0;
var alphaTrimFactor = 0;
var maxWindowSize = 9;
google.charts.load("current", {packages:["corechart"]});

var options = {
    title: "Histogram",
    width: 400,
    height: 100,
    legend: { position: "none" },
};

var hist;

var threshold = 0.5
var lambda = 1;
var constant = 25;
var bitSlicePos = 4;
var bitSliceValue = Math.pow(2, bitSlicePos);
var pointers = [0,0,0,0]

var meanMatrix = Matrix.getMeanMatrix(3)
var gaussianMatrix = Matrix.getGaussian();
var highPassMatrix = Matrix.getHighPass();
var sobelXMatrix = Matrix.getSobelX();
var sobelYMatrix = Matrix.getSobelY();

var rgb = [0, 0, 0];
var hsi = [0, 0, 0];
var cmy = [255, 255, 255];
var chromaValue = 10.;
var loadedChroma = false;

var haar_level = 0;

window.onload = function(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	canvas_back = document.getElementById('canvas-back');
	ctx_back = canvas_back.getContext('2d');

	$("#filters-simple").slideDown();

	hist = new google.visualization.ColumnChart(document.getElementById('hist'));

	createMatrix();

	$(initializeColorSlides);
}

function handleImage(e){

	let splt = e.target.value.split('\\').join('/').split('/');
	let filename = splt[splt.length - 1];

	$('#image-picker-label').text(filename);

    var reader = new FileReader();
    reader.onload = function(event){
        img.onload = function(){
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            drawHistogram(hist);
			$("#hist").removeClass("hide");
     		preparedToHaar = false;
        }

        img.src = event.target.result;
		$('#origin').attr("src",img.src);
    }
    reader.readAsDataURL(e.target.files[0]);

}

function handleImage2(e){
	let splt = e.target.value.split('\\').join('/').split('/');
	let filename = splt[splt.length - 1];

	$('#image-picker-label2').text(filename);

    var reader = new FileReader();
    reader.onload = function(event){
        img_back.onload = function(){
            ctx_back.drawImage(img_back, 0, 0, canvas_back.width, canvas_back.height);
            loadedChroma = true;
        }
        img_back.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function onFilterBlockClick(elementId) {
	let id = "#" + elementId;
	let isOpen = $(id).is(":visible");
	$(".filter-block").slideUp();
	if (!isOpen) $(id).slideDown();
}

function reset(){
	haar_level = 0;
	preparedToHaar = false;
	$('#canvas').width(600).height(400);
	ctx.canvas.width = 600;
	ctx.canvas.height = 400;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	drawHistogram(hist);
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
	return parseInt((i*canvas.width + j) * 4);
}

function getIJFromPixel(index) {
	let _i = index/4;
	return [parseInt(_i/canvas.width), _i%canvas.width];
}

function updateDimension(event){
	dimension = parseInt(event.target.value)
	matriz = new Matrix(dimension);
	meanMatrix = Matrix.getMeanMatrix(dimension);

	alphaTrimFactor = Math.min(alphaTrimFactor, dimension*dimension-1)
	$('#alpha_trim_slide').attr("max", dimension*dimension-1)
	$('#alpha_trim_slide').attr("value", alphaTrimFactor)
	$('#alpha_trim_max').text(dimension*dimension-1);
}

function updateReductionFactor(event){
	reductionFactor = parseInt(event.target.value)
}

function updateCounterHarmonicFactor(event) {
	counterHarmonicFactor = parseFloat(event.target.value)/2;
	document.getElementById("range_harmonic").innerHTML = counterHarmonicFactor.toFixed(1);
}

function updateAlphaTrimFactor(event) {
	alphaTrimFactor = parseInt(event.target.value)
	document.getElementById("range_alpha_trim").innerHTML= alphaTrimFactor;
}

function updateMatrix(i,j,event){
	matriz.set(i, j, math.eval(event.target.value));
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

function updatePreview(rgb){
	$('#preview').css('backgroundColor', "rgb("+rgb[0]+", "+rgb[1]+", "+rgb[2]+")");
}

function updateColors(func, event) {
	event.stopPropagation()
	func(event);
	updateBasedOnRGB();
}

function updateBasedOnRGB() {
	hsi = RGBtoHSI(rgb);
	cmy = RGBtoCMY(rgb);
	updateColorSlides();
	updatePreview(rgb);
	//console.log(hsi);
}

function updateR(event) {
	rgb[0] = event.target.value/1000;
}
function updateG(event) {
	rgb[1] = event.target.value/1000;
}
function updateB(event) {
	rgb[2] = event.target.value/1000;
}

function updateH(event) {
	hsi[0] = event.target.value/1000;
	rgb = HSItoRGB(hsi);
}
function updateS(event) {
	hsi[1] = event.target.value/1000;
	rgb = HSItoRGB(hsi);
}
function updateI(event) {
	hsi[2] = event.target.value/1000;
	rgb = HSItoRGB(hsi);
}

function updateC(event) {
	cmy[0] = event.target.value/1000;
	rgb = CMYtoRGB(cmy);
}
function updateM(event) {
	cmy[1] = event.target.value/1000;
	rgb = CMYtoRGB(cmy)
}
function updateY(event) {
	cmy[2] = event.target.value/1000;
	rgb = CMYtoRGB(cmy);
}

function initializeColorSlides() {
	$('#r_slide').slider({value: 0});
	$('#g_slide').slider({value: 0});
	$('#b_slide').slider({value: 0});
	$('#h_slide').slider({value: 0});
	$('#s_slide').slider({value: 0});
	$('#i_slide').slider({value: 0});
	$('#c_slide').slider({value: 255000});
	$('#m_slide').slider({value: 255000});
	$('#y_slide').slider({value: 255000});
}

function updateColorSlides() {
	$('#r_slide').val(rgb[0]*1000);
	$('#g_slide').val(rgb[1]*1000);
	$('#b_slide').val(rgb[2]*1000);
	$('#h_slide').val(hsi[0]*1000);
	$('#s_slide').val(hsi[1]*1000);
	$('#i_slide').val(hsi[2]*1000);
	$('#c_slide').val(cmy[0]*1000);
	$('#m_slide').val(cmy[1]*1000);
	$('#y_slide').val(cmy[2]*1000);
}

function updateChromaValue(event) {
	chromaValue = event.target.value/100;
}

function sigma(x) {
	return 255/(1+Math.exp(-(x - chromaValue)))
}

function runChroma() {
	if (loadedChroma) {

		var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pix = imgd.data;

		for (var i = 0; i < pix.length; i+=4) {
			let aux = RGBtoHSI([pix[i], pix[i+1], pix[i+2]]);

			let weights = [10, 1, 1];
			let weightSum = weights[0]+weights[1]+weights[2];
			
			let diff =(Math.abs(hsi[0]-aux[0])*weights[0] + Math.abs(hsi[1]-aux[1])*weights[1] + Math.abs(hsi[2]-aux[2])*weights[2])/weightSum;

			//if (i%1000 == 0) console.log(sigma(diff));
			pix[i+3] = sigma(diff);
		}

		ctx.putImageData(imgd, 0, 0);
	}
}


