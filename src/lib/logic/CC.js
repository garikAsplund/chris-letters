import {
	DISTRACTORS,
	LETTERS,
	NUMBER_OF_TRIALS,
	randomRange,
	shuffle
} from '$lib/logic/ConstantsAndHelpers';

export function createCCTrials(practice = false) {
	const CCLetters = [];
	const CCTargets = [];
	const CCTextColors = [];
	const CCBoxColors = [];

	const targetOffsets = Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 3)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 8))
		.sort(() => Math.random() - 0.5);

	const distractorColor = Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 'red')
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 'green'))
		.sort(() => Math.random() - 0.5);

	const distractorIndices = Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 4)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 5))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 6))
		.sort(() => Math.random() - 0.5);

	// console.log({ targetOffsets, distractorIndices, distractorColor });

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const CCLettersTrial = [];
		const CCTargetsTrial = [];
		const CCTextColorsTrial = [];
		const CCBoxColorsTrial = [];

		const targetOffset = targetOffsets[i];
		const distractorIndex = distractorIndices[i];
		const targetIndex = distractorIndex + targetOffset;

		const shuffledLetters = shuffle(LETTERS);

		while (CCLettersTrial.length < 16) {
			if (CCTargetsTrial.length === targetIndex) {
				CCTargetsTrial.push(true);
				CCTextColorsTrial.push('red');
			} else {
				CCTargetsTrial.push(false);
				CCTextColorsTrial.push(DISTRACTORS[randomRange(6) - 1]);
			}

			if (CCTargetsTrial.length === distractorIndex && !practice) {
				CCBoxColorsTrial.push(distractorColor[i]);
			} else {
				CCBoxColorsTrial.push('white');
			}

			CCLettersTrial.push(shuffledLetters[CCLettersTrial.length]);
		}

		CCLetters.push(CCLettersTrial);
		CCTargets.push(CCTargetsTrial);
		CCTextColors.push(CCTextColorsTrial);
		CCBoxColors.push(CCBoxColorsTrial);
	}

	let CCoutput = {
		letters: CCLetters,
		targets: CCTargets,
		textColors: CCTextColors,
		boxColors: CCBoxColors,
		targetOffsets,
		distractorColor,
		distractorIndices
	};

	console.log({CCoutput});

	return CCoutput;
}
