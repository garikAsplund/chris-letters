import {
	DISTRACTORS,
	LETTERS,
	NUMBER_OF_TRIALS,
	randomRange,
	shuffle
} from '$lib/logic/ConstantsAndHelpers';

export function createABTrials(practice = false) {
	const ABLetters = [];
	const ABTargets = [];
	const ABTextColors = [];

	if (practice) {
		const targetOffsets = shuffle(
			Array.from({ length: 2 }, () => 3).concat(Array.from({ length: 2 }, () => 8))
		).concat(
			shuffle(Array.from({ length: 2 }, () => 3).concat(Array.from({ length: 2 }, () => 8)))
		);

		console.log('ABPractice: ', { targetOffsets });

		const T1Indices = shuffle(
			Array.from({ length: 24 / 3 }, () => 4)
				.concat(Array.from({ length: 24 / 3 }, () => 5))
				.concat(Array.from({ length: 24 / 3 }, () => 6))
		);

		for (let i = 0; i < 8; i++) {
			const ABLettersTrial = [];
			const ABTargetsTrial = [];
			const ABTextColorsTrial = [];

			const targetOffset = targetOffsets[i];

			const T1Index = T1Indices[i];
			const T2Index = T1Index + targetOffset;

			const shuffledLetters = shuffle(LETTERS);

			while (ABLettersTrial.length < 16) {
				if (ABTargetsTrial.length === T1Index || ABTargetsTrial.length === T2Index) {
					ABTargetsTrial.push(true);
					ABTextColorsTrial.push('red');
				} else {
					ABTargetsTrial.push(false);
					let newColor;
					do {
						newColor = DISTRACTORS[randomRange(6) - 1];
					} while (
						ABTextColorsTrial.length > 0 &&
						newColor === ABTextColorsTrial[ABTextColorsTrial.length - 1]
					);
					ABTextColorsTrial.push(newColor);
				}

				ABLettersTrial.push(shuffledLetters[ABLettersTrial.length]);
			}

			ABLetters.push(ABLettersTrial);
			ABTargets.push(ABTargetsTrial);
			ABTextColors.push(ABTextColorsTrial);
		}
		console.log({ ABLetters, ABTargets, ABTextColors });

		return {
			letters: ABLetters,
			targets: ABTargets,
			textColors: ABTextColors,
			targetOffsets,
			T1Indices
		};
	} else {
		const targetOffsets = shuffle(
			Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 3).concat(
				Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 8)
			)
		);

		const T1Indices = shuffle(
			Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 4)
				.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 5))
				.concat(Array.from({ length: NUMBER_OF_TRIALS / 3 }, () => 6))
		);

		for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
			const ABLettersTrial = [];
			const ABTargetsTrial = [];
			const ABTextColorsTrial = [];

			const targetOffset = targetOffsets[i];

			const T1Index = T1Indices[i];
			const T2Index = T1Index + targetOffset;

			const shuffledLetters = shuffle(LETTERS);

			while (ABLettersTrial.length < 16) {
				if (ABTargetsTrial.length === T1Index || ABTargetsTrial.length === T2Index) {
					ABTargetsTrial.push(true);
					ABTextColorsTrial.push('red');
				} else {
					ABTargetsTrial.push(false);
					let newColor;
					do {
						newColor = DISTRACTORS[randomRange(6) - 1];
					} while (
						ABTextColorsTrial.length > 0 &&
						newColor === ABTextColorsTrial[ABTextColorsTrial.length - 1]
					);
					ABTextColorsTrial.push(newColor);
				}

				ABLettersTrial.push(shuffledLetters[ABLettersTrial.length]);
			}

			ABLetters.push(ABLettersTrial);
			ABTargets.push(ABTargetsTrial);
			ABTextColors.push(ABTextColorsTrial);
		}
		console.log({ ABLetters, ABTargets, ABTextColors });

		return {
			letters: ABLetters,
			targets: ABTargets,
			textColors: ABTextColors,
			targetOffsets,
			T1Indices
		};
	}
}
