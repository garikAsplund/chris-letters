import { randomRange } from '$lib/logic/ConstantsAndHelpers';

const NUMBER_OF_TRIALS = 60;
const DISTRACTORS = ['blue', 'green', 'yellow', 'purple', 'orange', 'pink'];
const LETTERS = [
	'A',
	'B',
	'C',
	// 'D',
	'E',
	// 'F',
	'G',
	'H',
	// 'I',
	'J',
	'K',
	// 'L',
	'M',
	'N',
	// 'O',
	'P',
	// 'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	// 'X',
	'Y',
	'Z'
];
const TARGETS = ['D', 'F'];
const PROBE = 'X';

function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export function createVABTrials() {
	const VABLetters = [];
	const VABTargets = [];
	const VABTextColors = [];

	const targetOffsets = Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 1)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 2))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 3))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 5))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 7))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 6 }, () => 9))
		.sort(() => Math.random() - 0.5);

	const T1Indices = Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 2)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 3))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 4))
		.sort(() => Math.random() - 0.5);

	const targets = Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 'F')
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 'D'))
		.sort(() => Math.random() - 0.5);

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const VABLettersTrial = [];
		const VABTargetsTrial = [];
		const VABTextColorsTrial = [];
		const shuffledLetters = shuffle(LETTERS);

		console.log({ shuffledLetters });
		let targetOffset = targetOffsets[i];

		let T1Index = T1Indices[i];
		let probeIndex = T1Index + targetOffset;

		while (VABLettersTrial.length < 16) {
			if (VABTargetsTrial.length === T1Index) {
				VABTargetsTrial.push(true);
				VABTextColorsTrial.push('red');
				VABLettersTrial.push(targets[i]);
			} else if (VABTargetsTrial.length === probeIndex) {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(PROBE);
			} else {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(shuffledLetters[VABLettersTrial.length]);
			}
		}

		VABLetters.push(VABLettersTrial);
		VABTargets.push(VABTargetsTrial);
		VABTextColors.push(VABTextColorsTrial);
	}

	console.log({ VABLetters, VABTargets, VABTextColors, targetOffsets, T1Indices });

	return {
		letters: VABLetters,
		targets: VABTargets,
		textColors: VABTextColors,
		targetOffsets,
		T1Indices
	};
}
