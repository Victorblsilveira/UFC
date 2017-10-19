var img = new Image();
var ctx;
var canvas;
var histogram;
var histogramNormalizer;
var dimension = 3;
var matrix = new Matrix(3);
var reductionFactor = 2;
var counterHarmonicFactor = 0;
var alphaTrimFactor = 0;
var maxWindowSize = 9;
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

var meanMatrix = Matrix.getMeanMatrix(3)
var gaussianMatrix = Matrix.getGaussian();
var highPassMatrix = Matrix.getHighPass();
var sobelXMatrix = Matrix.getSobelX();
var sobelYMatrix = Matrix.getSobelY();

var rgb = [0, 0, 0];
var hsi = [0, 0, 0];
var cmy = [255, 255, 255];

window.onload = function(){
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	console.log(rgb, hsi, cmy);

	$("#filters-simple").slideDown();

	histo_1 = new google.visualization.ColumnChart(document.getElementById('histo_1'));
	histo_2 = new google.visualization.ColumnChart(document.getElementById('histo_2'));

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
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);

            $("#h-line").removeClass("hide");

            drawHistogram(histo_1);
            drawHistogram(histo_2);
			showGraphs(true)
        }

        img.src = event.target.result;
		$('#origin').attr("src",img.src);
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
	ctx.drawImage(img, 0, 0);
	drawHistogram(histo_2);
}

function showGraphs(option){
	if (option) {
		$(".hist_son").removeClass("hide");
		$(".histo_options").removeClass("hide");
	} else {
		$(".hist_son").addClass("hide");
		$(".histo_options".addClass("hide"));
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
	return parseInt((i*canvas.width + j) * 4);
}

function getIJFromPixel(index) {
	i = index/4;
	return [parseInt(i/canvas.width), i%canvas.width];
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

function updateColors(func, event) {
	func(event);
	updateColorSlides();
}

function updateR(event) {
	rgb[0] = +event.target.value;
	hsi = RGBtoHSI(rgb);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}
function updateG(event) {
	rgb[1] = +event.target.value;
	hsi = RGBtoHSI(rgb);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}
function updateB(event) {
	rgb[2] = +event.target.value;
	hsi = RGBtoHSI(rgb);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}

function updateH(event) {
	hsi[0] = +event.target.value;
	rgb = HSItoRGB(hsi);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}
function updateS(event) {
	hsi[1] = +event.target.value;
	rgb = HSItoRGB(hsi);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}
function updateI(event) {
	hsi[2] = +event.target.value;
	rgb = HSItoRGB(hsi);
  cmy = RGBtoCMY(rgb)
	//cmy = colorNegative(rgb);
}

function updateC(event) {
	cmy[0] = 1 - parseInt(event.target.value)/255;
	rgb = CMYtoRGB(cmy);
	hsi = RGBtoHSI(rgb);
}
function updateM(event) {
	cmy[1] = 1 - parseInt(event.target.value)/255;
	rgb = CMYtoRGB(cmy);
	hsi = RGBtoHSI(rgb);
}
function updateY(event) {
	cmy[2] = 1 - parseInt(event.target.value)/255;
	rgb = CMYtoRGB(cmy);
	hsi = RGBtoHSI(rgb);
}

function initializeColorSlides() {
	$('#r_slide').slider({value: 0});
	$('#g_slide').slider({value: 0});
	$('#b_slide').slider({value: 0});
	$('#h_slide').slider({value: 0});
	$('#s_slide').slider({value: 0});
	$('#i_slide').slider({value: 0});
	$('#c_slide').slider({value: 255});
	$('#m_slide').slider({value: 255});
	$('#y_slide').slider({value: 255});
}

function updateColorSlides() {
	$('#r_slide').val(rgb[0]);
	$('#g_slide').val(rgb[1]);
	$('#b_slide').val(rgb[2]);
	$('#h_slide').val(hsi[0]);
	$('#s_slide').val(hsi[1]);
	$('#i_slide').val(hsi[2]);
	$('#c_slide').val((1-cmy[0])*255);
	$('#m_slide').val((1-cmy[1])*255);
	$('#y_slide').val((1-cmy[2])*255);
}
