import {
	randomRange,
	DISTRACTORS,
	LETTERS,
	NUMBER_OF_TRIALS
} from '$lib/logic/ConstantsAndHelpers';

export function createCCTrials() {
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

	const distractorIndices = Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 5)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 6))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 7))
		.sort(() => Math.random() - 0.5);

	// console.log({ targetOffsets, distractorIndices, distractorColor });

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const CCLettersTrial = [];
		const CCTargetsTrial = [];
		const CCTextColorsTrial = [];
		const CCBoxColorsTrial = [];

		let targetOffset = targetOffsets[i];
		let distractorIndex = distractorIndices[i];
		let targetIndex = distractorIndex + targetOffset;

		while (CCLettersTrial.length < 16) {
			let letterToAdd = randomRange(LETTERS.length) - 1;

			if (CCLettersTrial[CCLettersTrial.length - 1] === LETTERS[letterToAdd]) {
				letterToAdd = (letterToAdd + 1) % LETTERS.length;
			}

			if (CCTargetsTrial.length === targetIndex) {
				CCTargetsTrial.push(true);
				CCTextColorsTrial.push('red');
			} else {
				CCTargetsTrial.push(false);
				CCTextColorsTrial.push(DISTRACTORS[randomRange(6) - 1]);
			}

			if (CCTargetsTrial.length === distractorIndex) {
				CCBoxColorsTrial.push(distractorColor[i]);
			} else {
				CCBoxColorsTrial.push('white');
			}

			CCLettersTrial.push(LETTERS[letterToAdd]);
		}

		CCLetters.push(CCLettersTrial);
		CCTargets.push(CCTargetsTrial);
		CCTextColors.push(CCTextColorsTrial);
		CCBoxColors.push(CCBoxColorsTrial);
	}

	return {
		letters: CCLetters,
		targets: CCTargets,
		textColors: CCTextColors,
		boxColors: CCBoxColors,
		targetOffsets,
		distractorColor,
		distractorIndices
	};
}
