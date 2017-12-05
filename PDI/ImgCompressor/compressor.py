from PIL import Image
from pprint import pprint
from bitarray import bitarray
import numpy as np

compression_values = (1, 2, 3)

def array2imgdata(arr):
	print('\tConverting: array -> imgdata')
	return [(arr[i], arr[i+1], arr[i+2]) for i in range(0, len(arr), 3)]

def imgdata2array(imgdata):
	print('\tConverting: imgdata -> array')
	return np.array([x for rgb in imgdata for x in rgb])

def array2matrix(arr, shape):
	print('\tConverting: array -> matrix')
	i, j = shape
	return np.reshape(arr, (i, j, 3))

def matrix2array(matrix):
	print('\tConverting: matrix -> array')
	return matrix.flatten()

def imgdata2rgbdict(imgdata):
	print('\tConverting: dict -> imgdata')
	rgb = {'r':[], 'g':[], 'b':[]}
	for tup in imgdata:
		rgb['r'].append(tup[0])
		rgb['g'].append(tup[1])
		rgb['b'].append(tup[2])
	return rgb

def rgbdict2imgdata(rgbdict):
	print('\tConverting: imgdata -> rgbdict')
	return [(rgbdict['r'][i], rgbdict['g'][i], rgbdict['b'][i]) for i in range(len(rgbdict['r']))]

def imgdata2bits(imgdata):
	print('\tConverting: imgdata -> bits')
	rgbdict = imgdata2rgbdict(img.getdata())
	bit_string = ''.join([''.join( [format(rgbdict['r'][i]//2**compression_values[0], '{0:b}'.format(8-compression_values[0])), 
									format(rgbdict['g'][i]//2**compression_values[1], '{0:b}'.format(8-compression_values[1])),
									format(rgbdict['b'][i]//2**compression_values[2], '{0:b}'.format(8-compression_values[2]))])
						 for i in range(len(rgbdict['r']))])
	return bitarray(bit_string)

def bits2int(bits):
	i = 0
	for bit in bits:
		i = (i<<1) | bit
	return i

def bits2imgdata(bits):
	print('\tConverting: bits -> imgdata')
	a = 8-compression_values[0]
	b = a + 8 - compression_values[1]
	c = b + 8 - compression_values[2]
	data = [(bits2int(bits[i+0:i+a])*2**compression_values[0], 
			 bits2int(bits[i+a:i+b])*2**compression_values[1], 
			 bits2int(bits[i+b:i+c])*2**compression_values[2])
			for i in range(0, len(bits), 24 - sum(compression_values))]
	return data




def run_diff(rgbdict, start=0):
	print('\trunning diff')
	rdiff = [rgbdict['r'][i] for i in range(start+1)] + [rgbdict['r'][i] - rgbdict['r'][i-1] for i in range(start+1, len(rgbdict['r']))]
	gdiff = [rgbdict['g'][i] for i in range(start+1)] + [rgbdict['g'][i] - rgbdict['g'][i-1] for i in range(start+1, len(rgbdict['g']))]
	bdiff = [rgbdict['b'][i] for i in range(start+1)] + [rgbdict['b'][i] - rgbdict['b'][i-1] for i in range(start+1, len(rgbdict['b']))]
	return {'r':rdiff, 'g':gdiff, 'b':bdiff}

def revert_diff(rgbdiff, start=0):
	print('\treverting diff')
	newdict = { 
		'r': [rgbdiff['r'][i] for i in range(start+1)], 
		'g': [rgbdiff['g'][i] for i in range(start+1)], 
		'b': [rgbdiff['b'][i] for i in range(start+1)]
	}
	for i in range(start+1, len(rgbdiff['r'])):
		newdict['r'].append(newdict['r'][i-1] + rgbdiff['r'][i])
		newdict['g'].append(newdict['g'][i-1] + rgbdiff['g'][i])
		newdict['b'].append(newdict['b'][i-1] + rgbdiff['b'][i])
	return newdict

def haar_rows(matrix):
	means = (matrix[:, 1::2] + matrix[:, ::2])//2
	diffs = matrix[:, ::2] - means
	return np.concatenate((means, diffs), axis=1)

def haar_cols(matrix):
	means = (matrix[1::2, :] + matrix[::2, :])//2
	diffs = matrix[::2, :] - means
	return np.concatenate((means, diffs), axis=0)

def haar(matrix):
	matrix = haar_rows(matrix)
	matrix = haar_cols(matrix)
	return matrix

def full_haar(matrix):
	print('\t-- Full Haar Transform --')
	return recursive_haar(matrix)

def recursive_haar(matrix):
	if matrix.shape == (1, 1, 3): return matrix
	haar_mat = haar(matrix)
	haar_mat[:haar_mat.shape[0]//2, :haar_mat.shape[1]//2] = recursive_haar(haar_mat[:haar_mat.shape[0]//2, :haar_mat.shape[1]//2])
	return haar_mat

def runlength_compress(imgdata, shape):
	print('\n--> Run Length Compression <--\n')
	flat = imgdata2array(imgdata)
	mat = array2matrix(flat, shape)

	mat = full_haar(mat)
	flat = matrix2array(mat)
	print(len(flat))
	# print(flat[30700:30900])

	bit_string = ''
	last = flat[0]
	repeated = 1
	has_repeated = False
	for i in range(1, len(flat)):
		if flat[i] != last:
			s = '1' if has_repeated else '0'
			s += '1' if last > 0 else '0'
			if has_repeated: s += '{0:05b}'.format(repeated)
			s += '{0:08b}'.format(abs(last))
			bit_string += s
			repeated = 1
			has_repeated = False
			last = flat[i]
		else:
			has_repeated = True
			repeated += 1
	bit_string = '{0:032b}{1:032b}{2:032b}'.format(shape[0], shape[1], len(flat)) + bit_string
	return bitarray(bit_string)

def runlength_decompress(bitarray):
	print('\n--> Run Length Decompression <--\n')
	shape = (bits2int(bitarray[:32]), bits2int(bitarray[32:64]))
	arr = []
	i = 32*3
	size = bits2int(bitarray[64:96])
	while len(arr) < size:
		repeated = bitarray[i]
		positive = bitarray[i+1]
		i += 2
		n = 1
		if repeated:
			n = bits2int(bitarray[i:i+5])
			i += 5
		number = bits2int(bitarray[i:i+8])
		i += 8
		if not positive: number *= -1

		for j in range(n):
			arr.append(number)
		
		#print(i, '/', len(bitarray))
	arr = np.array(arr)
	print(len(arr))
	#print(arr[30700:30900])
	imgdata = array2imgdata(arr)
	return imgdata, shape


def lzw(imgdata):
	lzwdict = {}
	rgbdict = imgdata2rgbdict(imgdata)
	r, g, b = [], [], []
	# for x in rgbdict['r']:

def save_bit_array(filename, bits):
	print('\n>> Saving bit array to file: {} <<\n'.format(filename))
	with open(filename, 'wb') as f:
		bits.tofile(f)

def load_bit_array(filename):
	a = bitarray()
	with open(filename, 'rb') as f:
		a.fromfile(f)
	return a

def compress_image(img_file, compressed_file):
	img = Image.open(img_file)
	bits = runlength_compress(img.getdata(), img.size)
	save_bit_array('runlength.bin', bits)

def decompress_image(compressed_file):
	bits = load_bit_array(compressed_file)
	imgdata, shape = runlength_decompress(bits)
	img = Image.new('RGB', shape)
	img.putdata(imgdata)
	img.show()

compress_image('lena.bmp', 'runlength.bin')
decompress_image('runlength.bin')


