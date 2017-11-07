
function applyFilter(event, element, filter) {
	event.stopPropagation()
	element.classList.add('loading')
	loadHistogram();
	console.log(element.classList)
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	var copy = pix.slice();

	for (var i = 0; i < pix.length; i+=4) {
		filter(copy, pix, i);
	}

	ctx.putImageData(imgd, 0, 0);
	drawHistogram(histo_2);
	setTimeout(function(){
		element.classList.remove('loading')
	},2000)
	element.classList.remove('loading')

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
	if (matriz_ == undefined) matriz_ = matriz;
	let p = getIJFromPixel(i);
	let radius = (matriz_.getDim()-1)/2;
	let val = 0;
	for (let x = 0; x < matriz_.getDim(); x++) {
		for (let y = 0; y < matriz_.getDim(); y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				val += getMean(copy, getPixelIndex(_i, _j)) * matriz_.get(x, y);
			}
		}
	}
	pixels[i] = pixels[i+1] = pixels[i+2] = parseInt(val);
}

function meanFilter(copy, pixels, i) {
	convolution(copy, pixels, i, meanMatrix)
}

function meanFilterColored(copy, pixels, i) {
	p = getIJFromPixel(i);
	radius = (dimension-1)/2;
	valR = 0;
	valG = 0;
	valB = 0;
	for (var x = 0; x < dimension; x++) {
		for (var y = 0; y < dimension; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width) {
				valR += copy[getPixelIndex(_i, _j)];
				valG += copy[getPixelIndex(_i, _j)+1];
				valB += copy[getPixelIndex(_i, _j)+2];
			}
		}
	}
	pixels[i] = parseInt(valR/(dimension*dimension));
	pixels[i+1] = parseInt(valG/(dimension*dimension));
	pixels[i+2] = parseInt(valB/(dimension*dimension));
}

function highPass(copy, pixels, i){
	convolution(copy,pixels,i,highPassMatrix)
}

function lowPass(copy, pixels, i){
	convolution(copy,pixels,i,gaussianMatrix)
}

function bandReject(copy, pixels, i){
	lowPass(copy, pixels, i);
	aux = pixels[i]
	highPass(copy, pixels, i);
	pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i] + aux;
}

function sobelx(copy, pixels, i){
	convolution(copy,pixels,i,sobelXMatrix)
}

function sobely(copy, pixels, i){
	convolution(copy,pixels,i,sobelYMatrix)
}

function sobelSum(copy, pixels, i){
	sobelx(copy, pixels, i);
	aux = pixels[i]
	sobely(copy, pixels, i);
	pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i] + aux;
}


function highBoosting(copy, pixels, i){
	var c_ = 1;
	convolution(copy,pixels,i, meanMatrix)
	pixels[i] = pixels[i+1] = pixels[i+2] = getMean(copy, i) + c_ * (getMean(copy, i) - pixels[i]);
}

function median(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecMedian(getPixRegionVec(copy, i, dimension));
}

function getMeadian(copy, i){
	return vecMedian(getPixRegionVec(copy, i, dimension));
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

function getMeanInRegion(pix, i, j, size) {
	let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
	for (let k = 0; k < size; k++) {
		for (let l = 0; l < size; l++) {
			let index = getPixelIndex(i+k, j+l);
			sumR += pix[index];
			sumG += pix[index+1];
			sumB += pix[index+2];
			sumA += pix[index+3];
		}
	}
	sumR /= (reductionFactor*reductionFactor);
	sumG /= (reductionFactor*reductionFactor);
	sumB /= (reductionFactor*reductionFactor);
	sumA /= (reductionFactor*reductionFactor);
	return [sumR, sumG, sumB, sumA];
}

function imageReduction(withMean=false) {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	var w = parseInt(imgd.width/reductionFactor);
	var h = parseInt(imgd.height/reductionFactor);
	var new_imgd = ctx.createImageData(w, h);
	var new_pix = new_imgd.data;

	let pos = 0;
	for (let i = 0; i < canvas.height; i+=reductionFactor) {
		for (let j = 0; j < canvas.width; j+=reductionFactor) {
			let index = getPixelIndex(i, j);
			calcPix = (withMean)
				? getMeanInRegion(pix, i, j, reductionFactor)
				: [pix[index], pix[index+1], pix[index+2], pix[index+3]];
			new_pix[pos++] = calcPix[0];
			new_pix[pos++] = calcPix[1];
			new_pix[pos++] = calcPix[2];
			new_pix[pos++] = calcPix[3];
		}
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.putImageData(new_imgd, 0, 0);
}

function imageZoom() {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;
	var w = parseInt(imgd.width*reductionFactor);
	var h = parseInt(imgd.height*reductionFactor);
	var new_imgd = ctx.createImageData(w, h);
	var new_pix = new_imgd.data;

	let pos = 0;
	for (let i = 0; i < canvas.height; i++) {
		for (let j = 0; j < canvas.width; j++) {
			let index = getPixelIndex(Math.round(i/reductionFactor), Math.round(j/reductionFactor));
			new_pix[pos++] = pix[index];
			new_pix[pos++] = pix[index+1];
			new_pix[pos++] = pix[index+2];
			new_pix[pos++] = pix[index+3];
		}
		pos += 4*canvas.width*(reductionFactor-1);
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.putImageData(new_imgd, 0, 0);
}

function geometric(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecGeometricMean(getPixRegionVec(copy, i, dimension));
}

function harmonic(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecHarmonicMean(getPixRegionVec(copy, i, dimension));
}

function counterHarmonic(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecCounterHarmonicMean(getPixRegionVec(copy, i, dimension), counterHarmonicFactor);
}

function maxFilter(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecMax(getPixRegionVec(copy, i, dimension));
}

function minFilter(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecMin(getPixRegionVec(copy, i, dimension));
}

function midPointFilter(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecMidPoint(getPixRegionVec(copy, i, dimension));
}

function alphaTrimFilter(copy, pixels, i) {
	pixels[i] = pixels[i+1] = pixels[i+2] = vecAlphaTrim(getPixRegionVec(copy, i, dimension), alphaTrimFactor);
}

function adaptiveMedian(copy, pixels, i){
	pixels[i] = pixels[i+1] = pixels[i+2] = levelA(copy, i, 3);
}

function levelA(pix, i, dim) {
	vec = getPixRegionVec(pix, i, dim);
	zMin = vecMin(vec);
	zMax = vecMax(vec);
	zMed = vecMedian(vec);
	A1 = zMed - zMin;
	A2 = zMed - zMax;
	if (A1 > 0 && A2 < 0) return levelB(pix, i, zMin, zMax, zMed);
	if (dim + 2 <= maxWindowSize) return levelA(pix, i, dim + 2);
	return getMean(pix, i);
}

function levelB(pix, i, zMin, zMax, zMed) {
	z = getMean(pix, i);
	B1 = z - zMin;
	B2 = z - zMax;
	if (B1 > 0 && B2 < 0) return z;
	return zMed;
}

function adaptiveNoise() {
	var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var pix = imgd.data;

	variances = [];
	for (let i = 0; i < pix.length/4; i++) {
		vec = getPixRegionVec(pix, i*4, dimension);
		variances[i] = vecVariance(vec);
	}
	overallNoise = vecMean(variances);

	for (let i = 0; i < pix.length/4; i++) {
		vec = getPixRegionVec(pix, i*4, dimension);
		variances[i] = Math.max(variances[i], overallNoise);
		b = getMean(pix, i*4);
		pix[i*4] = pix[i*4+1] = pix[i*4+2] = b - (overallNoise/variances[i]) * (b - vecMean(vec));
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.putImageData(imgd, 0, 0);
}

function haarTransform(){

}


function haarInverse(){

}