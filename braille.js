
function createImageCanvas(src) {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("CANVAS");
		const image = new Image();

		image.onload = () => {
			//var scale = Math.min((200/img.width),(200/img.height));
			//image.width = image.width/50;
			//image.height = image.height/50;

			let width = image.width;
			let height = image.height;
			if (image.width != (settings.width * 2)) {
				width = settings.width * 2;
				height = width * image.height / image.width;
			}

			//nearest multiple
			canvas.width = width - (width % 2);
			canvas.height = height - (height % 4);
			canvas.height -= settings.sizeup
			canvas.height -= settings.sizedown
			canvas.width -= settings.sizeleft
			canvas.width -= settings.sizeright
			ctx = canvas.getContext("2d");
			ctx.fillStyle = "#FFFFFF"; //get rid of alpha
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.mozImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;
			ctx.imageSmoothingEnabled = settings.I4;


			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			//console.log(canvas.height)
			//console.log(canvas.width)
			//console.log(widthcalc(1449,canvas.height,width))

			resolve(canvas);
		}
		image.src = src;
	});
}




//function widthcalc(charcount,height,width){
//const mult = 7.8730158730158730158730158730159
//var newWidth = (((charcount*mult)/height)+ (width % 2))/2

//return Math.floor(newWidth);
//}


// https://stackoverflow.com/questions/13806483/increase-or-decrease-color-saturation rgb/hsv hsv/rgb functions by hoffmann https://stackoverflow.com/users/3485/hoffmann
RGBtoHSV = function (color) {
	var r, g, b, h, s, v;
	r = color[0];
	g = color[1];
	b = color[2];
	min = Math.min(r, g, b);
	max = Math.max(r, g, b);


	v = max;
	delta = max - min;
	if (max != 0)
		s = delta / max;        // s
	else {
		// r = g = b = 0        // s = 0, v is undefined
		s = 0;
		h = -1;
		return [h, s, 0];
	}
	if (r === max)
		h = (g - b) / delta;      // between yellow & magenta
	else if (g === max)
		h = 2 + (b - r) / delta;  // between cyan & yellow
	else
		h = 4 + (r - g) / delta;  // between magenta & cyan
	h *= 60;                // degrees
	if (h < 0)
		h += 360;
	if (isNaN(h))
		h = 0;
	return [h, s, v];
};
// https://stackoverflow.com/questions/13806483/increase-or-decrease-color-saturation rgb/hsv hsv/rgb functions by hoffmann https://stackoverflow.com/users/3485/hoffmann
HSVtoRGB = function (color) {
	var i;
	var h, s, v, r, g, b;
	h = color[0];
	s = color[1];
	v = color[2];
	if (s === 0) {
		// achromatic (grey)
		r = g = b = v;
		return [r, g, b];
	}
	h /= 60;            // sector 0 to 5
	i = Math.floor(h);
	f = h - i;          // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
	switch (i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:        // case 5:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [r, g, b];
}


function pixelsToCharacter(pixels_lo_hi) { //expects an array of 8 bools
	//Codepoint reference - https://www.ssec.wisc.edu/~tomw/java/unicode.html#x2800
	const shift_values = [0, 1, 2, 6, 3, 4, 5, 7]; //correspond to dots in braille chars compared to the given array
	let codepoint_offset = 0;
	for (const i in pixels_lo_hi) {
		codepoint_offset += (+pixels_lo_hi[i]) << shift_values[i];

	}

	if (codepoint_offset === 0 && settings.monospace === false) { //pixels were all blank
		codepoint_offset = 4; //0x2800 is a blank braille char, 0x2804 is a single dot
	}
	return String.fromCharCode(0x2800 + codepoint_offset);
}

function toGreyscale(r, g, b) {
	switch (settings.greyscale_mode) {
		case "luminance":
			return (0.22 * r) + (0.72 * g) + (0.06 * b);

		case "lightness":
			return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;

		case "average":
			return (r + g + b) / 3;

		case "value":
			return Math.max(r, g, b);

		default:
			console.error("Greyscale mode is not valid");
			return 0;
	}
}

intensityToFunc = function(mode){
	switch (mode) {
		case "pow":
			return Math.pow
		case "sqrt":
			return Math.sqrt  //works with second value: Math.random Math.cbrt Math.imul Math.expm1 Math.exp Math.atan2 Math.atan Math.log1p  Math.clz32 Math.sin
		case "floor":
			return Math.floor
		case "max":
			return Math.max
		case "min":
			return Math.min
		case "random":
			return Math.random
		case "cbrt":
			return Math.cbrt
		case "imul":
			return Math.imul
		case "expm1":
			return Math.expm1
		case "exp":
			return Math.exp
		case "atan2":
			return Math.atan2
		case "atan":
			return Math.atan
		case "log1p":
			return Math.log1p
		case "clz32":
			return Math.clz32
		case "sin":
			return Math.sin
		default:
			console.error("Intensity Mode is Not Valid!");
			return Math.pow
	}
}

function canvasToText(canvas) {
	const start = performance.now();
	const redIntensity = parseFloat(document.getElementById('redIntensity').value) || 2;
	const greenIntensity = parseFloat(document.getElementById('greenIntensity').value) || 2;
	const blueIntensity = parseFloat(document.getElementById('blueIntensity').value) || 2;
	const hue = document.getElementById('hue').value;
	const sat = document.getElementById('saturation').value;
	const val = document.getElementById('value').value;
	const thr = document.getElementById('threshold').value;
	const intensitymode = intensityToFunc(settings.intensity_mode);

	const mcMaxRgb = {
			black: { rgb: [0, 0, 0], cc: '&0' },
			darkBlue: { rgb: [0, 0, 170], cc: '&1' },
			darkGreen: { rgb: [0, 170, 0], cc: '&2' },
			darkAqua: { rgb: [0, 170, 170], cc: '&3' },
			darkRed: { rgb: [170, 0, 0], cc: '&4' },
			darkPurple: { rgb: [170, 0, 170], cc: '&5' },
			gold: { rgb: [255, 170, 0], cc: '&6' },
			gray: { rgb: [170, 170, 170], cc: '&7' },
			darkGray: { rgb: [85, 85, 85], cc: '&8' },
			blue: { rgb: [85, 85, 255], cc: '&9' },
			green: { rgb: [85, 255, 85], cc: '&a' },
			aqua: { rgb: [85, 255, 255], cc: '&b' },
			red: { rgb: [255, 85, 85], cc: '&c' },
			lightPurple: { rgb: [255, 85, 255], cc: '&d' },
			yellow: { rgb: [255, 255, 85], cc: '&e' },
			white: { rgb: [255, 255, 255], cc: '&f' }
	}

	const ctx = canvas.getContext('2d');

	const width = canvas.width;
	const height = canvas.height;

	let image_data = [];
	if (settings.dithering) {
		if (settings.last_dithering === null || settings.last_dithering.canvas !== canvas) {
			settings.last_dithering = new Dithering(canvas);
		}
		image_data = settings.last_dithering.image_data;
	} else {
		image_data = new Uint8Array(ctx.getImageData(0, 0, width, height).data.buffer);
	}

	let output = "";
	let clr = "";

	for (let imgy = 0; imgy < height; imgy += 4) {
		let oldclr = "";
		for (let imgx = 0; imgx < width; imgx += 2) {
			const braille_info = [0, 0, 0, 0, 0, 0, 0, 0];
			let dot_index = 0;
			for (let x = 0; x < 2; x++) {
				for (let y = 0; y < 4; y++) {
					const index = (imgx + x + width * (imgy + y)) * 4;
					const pixel_data = image_data.slice(index, index + 4);
					if (pixel_data[3] >= 128) {
						const grey = toGreyscale(pixel_data[0], pixel_data[1], pixel_data[2]);
						if (settings.minecraft) {
							let temppix = RGBtoHSV(pixel_data)
							let temppix2 = HSVtoRGB([temppix[0] * hue, temppix[1] * sat, temppix[2] * val])
							rgbToMcColorCode(temppix2[0], temppix2[1], temppix2[2])
						}
						if (settings.inverted) {
							if (grey >= thr) braille_info[dot_index] = 1;
						} else {
							if (grey <= thr) braille_info[dot_index] = 1;
						}
					}
					dot_index++;
				}
			}

			const character = pixelsToCharacter(braille_info);
			const blank = String.fromCharCode(0x2800);
			if (settings.minecraft) {
				if (!settings.boxes) {
					if (character === blank) {
						output += character;
					} else {
						oldclr !== clr ? output += clr + settings.style_mode + character : output += character;
					}
				} else {
					oldclr !== clr ? output += clr + settings.style_mode + settings.char : output += settings.char;
				}
				oldclr = clr
			} else {
				output += character;
			}
		}
		output += "\n";
	}

	function rgbToMcColorCode(r, g, b) {
		let minDistance = Infinity;
		let closestColor = null;
		for (const color in mcMaxRgb) {
			const colorDistance =
			intensitymode(r - mcMaxRgb[color]["rgb"][0], redIntensity) + 
			intensitymode(g - mcMaxRgb[color]["rgb"][1], greenIntensity) + 
			intensitymode(b - mcMaxRgb[color]["rgb"][2], blueIntensity);

			if (colorDistance < minDistance) {
				minDistance = colorDistance;
				closestColor = color;
			}
		}

		return clr = mcMaxRgb[closestColor]["cc"]
	}
	const end = performance.now();
	console.log(`Execution time: ${(end - start).toFixed(3)} milliseconds`);
	return output;
}
