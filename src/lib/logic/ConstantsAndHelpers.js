export const NUMBER_OF_TRIALS = 96;

export const LETTERS = [
	'B',
	'C',
	'D',
	'F',
	'G',
	'H',
	'J',
	'K',
	'L',
	'M',
	'N',
	'P',
	'R',
	'S',
	'T',
	'V',
	'W',
	'X',
	'Y',
	'Z'
];

export const DISTRACTORS = [
	'rgb(0,0,255)', // blue
	'rgb(200,200,0)', // yellow
	'rgb(200,0,200)', // magenta
	'rgb(0,200,200)', // cyan
	'rgb(200,200,200)', // light grey
	'rgb(50,50,50)' // dark grey
];

export function randomRange(max) {
	return Math.ceil(Math.random() * max);
}

export function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}
