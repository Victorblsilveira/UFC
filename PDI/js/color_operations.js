
function RGBtoHSI(rgb) {
	r = rgb[0]/255;
	g = rgb[1]/255;
	b = rgb[2]/255;
	cMax = Math.max(r, g, b);
	cMin = Math.min(r, g, b);
	delta = cMax - cMin;
	H =   (delta == 0) ? 0
		: (cMax == r) ? 60 * (((g-b)/delta)%6)
		: (cMax == g) ? 60 * (((b-r)/delta) + 2)
		: 60 * (((r-g)/delta) + 4);
	H /= 360;
	S = (cMax == 0) ? 0 : delta/cMax;
	I = (r+g+b)/3;
	return roundVec(H*255, S*255, I*255);
}

function toRad(theta) {
	return Math.PI*theta/180;
}

function HSItoRGB(hsi) {
	h = hsi[0]*360/255;
	s = hsi[1]/255;
	i = hsi[2]/255;
	x1 = (1-s)/3;
	x2 = (1 + s*Math.cos(toRad(h))/Math.cos(toRad(60-h)))/3;
	x3 = 1-x1-x2;
	if (h < 120) {
		b = x1;
		r = x2;
		g = x3;
	} else if (h < 240) {
		r = x1;
		g = x2;
		b = x3;
	} else {
		g = x1;
		b = x2;
		r = x3;
	}
	return roundVec(3*i*r*255, 3*i*g*255, 3*i*b*255);
}

function colorNegative(xyz) {
	return roundVec(255-xyz[0], 255-xyz[1], 255-xyz[2]);
}

function roundVec(x, y, z) {
	return [Math.round(x), Math.round(y), Math.round(z)];
}

