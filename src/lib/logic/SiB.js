import {
	DISTRACTORS,
	LETTERS,
	NUMBER_OF_TRIALS,
	randomRange,
	shuffle,
} from "$lib/logic/ConstantsAndHelpers";

export function createSiBTrials(practice = false, second = false) {
	const SiBLetters = [];
	const SiBTargets = [];
	const SiBTextColors = [];
	const SiBSurprise = [];

	const surpriseTrials = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // CHANGE BACK 

	// if (!practice) {
	// 	while (surpriseTrials.length < 12) {
	// 		// const trial = second ? randomRange(60) + 35 : randomRange(60);
	// 		const trial = randomRange(95);

	// 		if (
	// 			surpriseTrials.includes(trial) ||
	// 			surpriseTrials.includes(trial - 1) ||
	// 			surpriseTrials.includes(trial + 1)
	// 		) {
	// 			continue;
	// 		}

	// 		surpriseTrials.push(trial);
	// 	}
	// }

	console.log({ surpriseTrials });

	const targetIndices = shuffle(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 6)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 7))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 8))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 9))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 10))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 11))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 12))
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 8 }, () => 13)));

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const SiBLettersTrial = [];
		const SiBTargetsTrial = [];
		const SiBTextColorsTrial = [];
		const SiBSurpriseTrial = [];

		const targetOffset = 3;

		const targetIndex = targetIndices[i];
		const surpriseIndex = targetIndex - targetOffset;

		const shuffledLetters = shuffle(LETTERS);

		while (SiBLettersTrial.length < 16) {

			if (SiBTargetsTrial.length === targetIndex) {
				SiBTargetsTrial.push(true);
				SiBTextColorsTrial.push("red");
			} else {
				SiBTargetsTrial.push(false);
				SiBTextColorsTrial.push(DISTRACTORS[randomRange(6) - 1]);
			}

			if (
				surpriseTrials.includes(SiBSurprise.length) &&
				SiBSurpriseTrial.length === surpriseIndex
			) {
				SiBSurpriseTrial.push(true);
			} else {
				SiBSurpriseTrial.push(false);
			}

			SiBLettersTrial.push(shuffledLetters[SiBLettersTrial.length]);
		}

		SiBLetters.push(SiBLettersTrial);
		SiBTargets.push(SiBTargetsTrial);
		SiBTextColors.push(SiBTextColorsTrial);
		SiBSurprise.push(SiBSurpriseTrial);
	}

	return {
		letters: SiBLetters,
		targets: SiBTargets,
		textColors: SiBTextColors,
		surprise: SiBSurprise,
		targetIndices,
	};
}
