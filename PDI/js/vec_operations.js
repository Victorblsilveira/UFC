function getPixRegionVec(pix, i, dim) {
	p = getIJFromPixel(i);
	radius = (dim-1)/2;
	vec = [];
	pos = 0;
	for (var x = 0; x < dim; x++) {
		for (var y = 0; y < dim; y++) {
			_i = x - radius + p[0];
			_j = y - radius + p[1];
			if (_i >= 0 && _i < canvas.height && _j >= 0 && _j < canvas.width)
				vec[pos++] = getMean(pix, getPixelIndex(_i, _j));
		}
	}
	return vec;
}

function vecMean(vec) {
	return vecCounterHarmonicMean(vec, 0);
}

function vecMedian(vec) {
	vec.sort( function(a,b) {return a - b;} );
	var half = Math.floor(vec.length/2);
	if(vec.length % 2)
        return vec[half];
    else
        return (vec[half-1] + vec[half]) / 2.0;
}

function vecGeometricMean(vec) {
	let mul = 1;
	for (let i in vec) {
		mul *= vec[i];
	}
	return Math.pow(mul, 1/vec.length);
}

function vecHarmonicMean(vec) {
	return vecCounterHarmonicMean(vec, -1);
}

function vecCounterHarmonicMean(vec, q) {
	let num = 0;
	let den = 0;
	for (let i in vec) {
		num += Math.pow(vec[i], q+1);
		den += Math.pow(vec[i], q);
	}
	return num/den;
}