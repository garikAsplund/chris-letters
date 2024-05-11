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

	// Create separate arrays for each combination
	const red3Trials = Array.from({ length: 24 }, () => ({
		targetOffset: 3,
		distractorColor: 'red'
	}));
	const red8Trials = Array.from({ length: 24 }, () => ({
		targetOffset: 8,
		distractorColor: 'red'
	}));
	const green3Trials = Array.from({ length: 24 }, () => ({
		targetOffset: 3,
		distractorColor: 'green'
	}));
	const green8Trials = Array.from({ length: 24 }, () => ({
		targetOffset: 8,
		distractorColor: 'green'
	}));

	// Shuffle and concatenate the trials
	const trials = shuffle([...red3Trials, ...red8Trials, ...green3Trials, ...green8Trials]);

	const distractorIndices = shuffle(
		Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 4)
			.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 5))
			.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 6))
	);

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const CCLettersTrial = [];
		const CCTargetsTrial = [];
		const CCTextColorsTrial = [];
		const CCBoxColorsTrial = [];

		const { targetOffset, distractorColor } = trials[i];
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
				CCBoxColorsTrial.push(distractorColor);
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
		targetOffsets: trials.map(({ targetOffset }) => targetOffset),
		distractorColor: trials.map(({ distractorColor }) => distractorColor),
		distractorIndices,
	};
	

	console.log({ CCoutput });
	return CCoutput;
}
