var Matrix = function(dim, start) {

	var self = {};

	self.matrix = []
	for (let i = 0; i < dim; i++) {
		self.matrix[i] = [];
		for (let j = 0; j < dim; j++) {
			self.matrix[i][j] = (start == undefined)? 0 : start;
		}
	}
	self.dim = dim;

	self.getDim = function() {
		return self.dim;
	}

	self.get = function(i, j) {
		return self.matrix[i][j];
	}

	self.set = function(i, j, element) {
		if (element == undefined) self.matrix[i] = j;
		else self.matrix[i][j] = element;
	}

	self.divide = function(k) {
		for (let i in self.matrix)
			for (let j in self.matrix[i])
				self.matrix[i][j] /= k;
	}

	self.normalize = function() {
		let sum = 0;
		for (let i in self.matrix)
			for (let j in self.matrix[i])
				sum += self.matrix[i][j];
		if (sum != 0)
			self.divide(sum);
	}

	self.sum = function(other) {
		if (other.getDim() != self.dim) return;
		for (let i in self.matrix)
			for (let j in self.matrix[i])
				self.matrix[i][j] += other.get(i, j);
	}

	return self;

};

Matrix.sum = function(m1, m2) {
	if (m1.getDim() != m2.getDim()) return;
	let res = new Matrix(m1.getDim());
	for (let i = 0; i < m1.getDim(); i++)
		for (let j = 0; j < m1.getDim(); j++)
			res.set(i, j, m1.get(i, j) + m2.get(i, j));
	return res;
};

Matrix.getMeanMatrix = function(dim) {
	return new Matrix(dim, 1/(dim*dim));
};

Matrix.getGaussian = function(dim) {
	if (dim == undefined) dim = 3;
	let m = new Matrix(dim);
	let r = (m.getDim()-1)/2;
	let sigma = 1;
	for (let i = 0; i < m.getDim(); i++) {
		for (let j = 0; j < m.getDim(); j++) {
			let y = i-r;
			let x = j-r;
			let g = 1/(2*Math.PI*sigma*sigma) * Math.exp(-(x*x + y*y)/(2*sigma*sigma))
			m.set(i, j, g);
		}
	}

	m.normalize();

	return m;
};

Matrix.getHighPass = function() {
	var matriz_ = new Matrix(3);

	matriz_.set(0, [ 0,-1, 0]);
	matriz_.set(1, [-1, 4,-1]);
	matriz_.set(2, [ 0,-1, 0]);

	return matriz_;
};

Matrix.getSobelX = function() {
	var matriz_ = new Matrix(3);

	matriz_.set(0, [-1, 0, 1]);
	matriz_.set(1, [-2, 0, 2]);
	matriz_.set(2, [-1, 0, 1]);

	return matriz_;
};

Matrix.getSobelY = function() {
	var matriz_ = new Matrix(3);

	matriz_.set(0, [-1,-2,-1]);
	matriz_.set(1, [ 0, 0, 0]);
	matriz_.set(2, [ 1, 2, 1]);

	return matriz_;
};