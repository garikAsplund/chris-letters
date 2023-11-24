import {
	randomRange,
	DISTRACTORS,
	LETTERS,
	NUMBER_OF_TRIALS
} from '$lib/logic/ConstantsAndHelpers';

export function createSiBTrials(practice = false) {
	const SiBLetters = [];
	const SiBTargets = [];
	const SiBTextColors = [];
	const SiBSurprise = [];

	const surpriseTrials = [];
	const surpriseTrials2 = [];

	if (!practice) {
		while (surpriseTrials.length < 6) {
			let trial = randomRange(60 - 1);

			if (
				surpriseTrials.includes(trial) ||
				surpriseTrials.includes(trial - 1) ||
				surpriseTrials.includes(trial + 1)
			) {
				continue;
			}

			surpriseTrials.push(trial);
		}

		while (surpriseTrials2.length < 6) {
			let trial = randomRange(60 - 1) + 36;

			if (
				surpriseTrials2.includes(trial) ||
				surpriseTrials2.includes(trial - 1) ||
				surpriseTrials2.includes(trial + 1)
			) {
				continue;
			}

			surpriseTrials2.push(trial);
		}
	}

	console.log({ surpriseTrials });
	console.log({ surpriseTrials2 });

	while (SiBLetters.length < NUMBER_OF_TRIALS) {
		const SiBLettersTrial = [];
		const SiBTargetsTrial = [];
		const SiBTextColorsTrial = [];
		const SiBSurpriseTrial = [];

		let targetOffset = 3;

		let targetIndex = 6;
		targetIndex += randomRange(8);
		let surpriseIndex = targetIndex - targetOffset;

		while (SiBLettersTrial.length < 16) {
			let letterToAdd = randomRange(LETTERS.length - 1);

			if (SiBLettersTrial[SiBLettersTrial.length - 1] === LETTERS[letterToAdd]) {
				letterToAdd = (letterToAdd + 1) % LETTERS.length;
			}

			if (SiBTargetsTrial.length === targetIndex) {
				SiBTargetsTrial.push(true);
				SiBTextColorsTrial.push('red');
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

			SiBLettersTrial.push(LETTERS[letterToAdd]);
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
		surprise: SiBSurprise
	};
}
