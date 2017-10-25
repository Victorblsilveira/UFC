
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
	H = H<0 ? H+360 : H;
	H /= 360;
	S = (cMax == 0) ? 0 : delta/cMax;
	//S = cMean < 0.5 ? delta/(cMax+cMin) : delta / (2 - cMax - cMin);
	I = (r+g+b)/3;
	return [H*255, S*255, I*255];
}

function toRad(theta) {
	return Math.PI*theta/180;
}

function HSItoRGB(hsi) {
	h = hsi[0]*360/255;
	s = Math.min(hsi[1]/255, 1);
	i = Math.min(hsi[2]/255, 1);
	if (s == 0) return [i*255, i*255, i*255];
	if (h < 120) {
		b = (1-s)/3;
		r = (1 + s*Math.cos(toRad(h))/Math.cos(toRad(60-h)))/3;
		g = 1-r-b;
	} else if (h < 240) {
		h -= 120;
		r = (1-s)/3;
		g = (1 + s*Math.cos(toRad(h))/Math.cos(toRad(60-h)))/3;
		b = 1-g-r;
	} else {
		h -= 240;
		g = (1-s)/3;
		b = (1 + s*Math.cos(toRad(h))/Math.cos(toRad(60-h)))/3;
		r = 1-b-g;
	}
	r = Math.max(0, Math.min(r, 1));
	g = Math.max(0, Math.min(g, 1));
	b = Math.max(0, Math.min(b, 1));
	return [3*i*r*255, 3*i*g*255, 3*i*b*255];
}

function colorNegative(xyz) {
	return [255-xyz[0], 255-xyz[1], 255-xyz[2]];
}

function RGBtoCMY(rgb){
	return colorNegative(rgb);
}

function CMYtoRGB(cmy){
	return colorNegative(cmy);
}
