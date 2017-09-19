
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

function convolution(copy, pixels, i, matriz_) {
	p = getIJFromPixel(i);
	radius = (dimension-1)/2;
	val = 0;
	if (matriz_ != undefined){matriz = matriz_}
	for (var x = 0; x < dimension; x++) {
		for (var y = 0; y < dimension; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				val += getMean(copy, getPixelIndex(_i, _j)) * matriz[x][y];
			}
		}
	}
	pixels[i] = pixels[i+1] = pixels[i+2] = parseInt(val);
}

function meanFilter(copy, pixels, i) {
	p = getIJFromPixel(i);
	radius = (dimension-1)/2;
	val = 0;
	for (var x = 0; x < dimension; x++) {
		for (var y = 0; y < dimension; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				val += getMean(copy, getPixelIndex(_i, _j));
			}
		}
	}
	pixels[i] = pixels[i+1] = pixels[i+2] = parseInt(val/(dimension*dimension));
}

function sobelx(copy, pixels, i){
	var matriz_ = init_mat(3,3);
	
	matriz_[0][0] = -1
	matriz_[0][1] = -2
	matriz_[0][2] = -1
	matriz_[1][0] = matriz_[1][2] = matriz_[1][1] = 0
	matriz_[2][0] = 1
	matriz_[2][1] = 2
	matriz_[2][2] = 1
	
	convolution(copy,pixels,i,matriz_)
}
function init_mat(dx,dy){
	var matriz_ = []
	for (var i=0;i<dx;i++){
		matriz_[i] = []
		for (var j=0;j<dy;j++){
			matriz_[i][j] = 0
		}
	}
	return matriz_
}

function sobely(copy, pixels, i){
	var matriz_ = init_mat(3,3);
	
	matriz_[0][0] = -1
	matriz_[0][1] =  0
	matriz_[0][2] =  1
	matriz_[1][0] = -2
	matriz_[1][2] = 0 
	matriz_[1][1] = 2
	matriz_[2][0] = -1
	matriz_[2][1] = 0 
	matriz_[2][2] = 1
	
	convolution(copy,pixels,i,matriz_)	
}

function sobelSum(copy, pixels, i){
	sobelx(copy, pixels, i);
	aux = pixels[i]
	sobely(copy, pixels, i);
	pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i] + aux;
}

function highBoosting(copy, pixels, i){
	var c_ = 1;
	var matriz_ = init_mat(3,3);
	
	matriz_[0][0] = 
	matriz_[0][1] = 
	matriz_[0][2] = 
	matriz_[1][0] = 
	matriz_[1][2] = 
	matriz_[1][1] = 
	matriz_[2][0] = 
	matriz_[2][1] = 
	matriz_[2][2] = 1/9;
	
	convolution(copy,pixels,i,matriz_)

	pixels[i] = pixels[i+1] = pixels[i+2] = getMean(copy, i) + c_ * (getMean(copy, i) - pixels[i]);
}

function calculateMedian(vec) {
	vec.sort( function(a,b) {return a - b;} );
	var half = Math.floor(vec.length/2);
	if(vec.length % 2)
        return vec[half];
    else
        return (vec[half-1] + vec[half]) / 2.0;
}

function median(copy, pixels, i) {
	p = getIJFromPixel(i);
	radius = (dimension-1)/2;
	vec = [];
	pos = 0;
	for (var x = 0; x < dimension; x++) {
		for (var y = 0; y < dimension; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				vec[pos] = getMean(copy, getPixelIndex(_i, _j));
				pos++;
			}
		}
	}

	pixels[i] = pixels[i+1] = pixels[i+2] = calculateMedian(vec);
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
	if (matriz[i] == undefined) matriz[i] = [];
	matriz[i][j] = math.eval(event.target.value)
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
