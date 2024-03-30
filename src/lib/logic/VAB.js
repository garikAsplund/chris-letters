import { randomRange, shuffle } from '$lib/logic/ConstantsAndHelpers';

let NUMBER_OF_TRIALS = 28;
const GCD = 30;
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
// const TARGETS = ["D", "F"];
const PROBE = 'X';

// 3 practice blocks of 8 trials each.
// The first block contained targets but no probes;
// the second block contained probes but no targets;
// and the third block contained both.

function helperVAB(practice = false, round = 0) {
	let VABLetters = [];
	let VABTargets = [];
	let VABTextColors = [];
	let VABSurprise = [];

	practice ? (NUMBER_OF_TRIALS = 8) : (NUMBER_OF_TRIALS = 28);

	const targetOffsets = shuffle(
		Array.from({ length: GCD / 6 }, () => 1)
			.concat(Array.from({ length: GCD / 6 }, () => 2))
			.concat(Array.from({ length: GCD / 6 }, () => 3))
			.concat(Array.from({ length: GCD / 6 }, () => 5))
			.concat(Array.from({ length: GCD / 6 }, () => 7))
			.concat(Array.from({ length: GCD / 6 }, () => 9))
	).slice(0, NUMBER_OF_TRIALS);

	const T1Indices = shuffle(
		Array.from({ length: GCD / 3 }, () => 2)
			.concat(Array.from({ length: GCD / 3 }, () => 3))
			.concat(Array.from({ length: GCD / 3 }, () => 4))
	).slice(0, NUMBER_OF_TRIALS);

	const targets = shuffle(
		Array.from({ length: GCD / 2 }, () => 'F').concat(Array.from({ length: GCD / 2 }, () => 'D'))
	).slice(0, NUMBER_OF_TRIALS);

	const probes = shuffle(
		Array.from({ length: (NUMBER_OF_TRIALS * 3) / 4 }, () => true).concat(
			Array.from({ length: NUMBER_OF_TRIALS / 4 }, () => false)
		)
	).slice(0, NUMBER_OF_TRIALS);

	// 2 sessions
	// 6 blocks per session
	// Across the 24 surprise trials in each session, 12 (50%) were surprise-probe lag 3,
	// 6 (25%) were surprise-probe lag 7, and 6 (25%) contained a surprise stimulus but no probe.
	// not the first 3, or last, at least 2 separated
	// 4 SiBs per block--2 lag 3, 1 lag 7, 1 no probe

	const surprise = shuffle(Array.from({ length: 28 }, () => false));

	const surpriseOffsets = shuffle(
		Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 2).concat(
			Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 6)
		)
	);

	// console.log({ targetOffsets, T1Indices, targets, probes, surprise, surpriseOffsets });

	// function createTrials() {
	let numberOfSurprises = 0;
	let lastSurpriseIndex = 0;
	// create variables for lag 3 and lag 7 and no probe
	let lag3 = 2;
	let lag7 = 1;
	let noProbe = 1;

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const VABLettersTrial = [];
		const VABTargetsTrial = [];
		const VABTextColorsTrial = [];
		const VABSurpriseTrial = [];
		const shuffledLetters = shuffle(LETTERS);

		// console.log({ shuffledLetters });
		const targetOffset = targetOffsets[i];
		const surpriseOffset = surpriseOffsets[i];

		const T1Index = T1Indices[i];
		const probeIndex = T1Index + targetOffset;
		const surpriseIndex = T1Index + surpriseOffset;

		while (VABLettersTrial.length < 16) {
			if (VABTargetsTrial.length === T1Index && round !== 2) {
				VABTargetsTrial.push(true);
				VABTextColorsTrial.push('red');
				VABLettersTrial.push(targets[i]);
			} else if (probes[i] && VABTargetsTrial.length === probeIndex && round !== 1) {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(PROBE);
			} else {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(shuffledLetters[VABLettersTrial.length]);
			}

			if (
				i >= 3 &&
				i < NUMBER_OF_TRIALS - 1 &&
				numberOfSurprises < 4 &&
				i - 2 > lastSurpriseIndex &&
				!practice
			) {
				if (
					lag3 > 0 &&
					// surprise[i] &&
					VABSurpriseTrial.length === probeIndex - 3 &&
					// surpriseOffset === 2
					probeIndex === 9
				) {
					VABSurpriseTrial.push(true);
					numberOfSurprises++;
					lastSurpriseIndex = i;
					lag3--;
				} else if (
					lag7 > 0 &&
					// surprise[i] &&
					VABSurpriseTrial.length === probeIndex - 7 &&
					// surpriseOffset === 6
					probeIndex === 9
				) {
					VABSurpriseTrial.push(true);
					numberOfSurprises++;
					lastSurpriseIndex = i;
					lag7--;
				} else if (
					noProbe > 0 &&
					// surprise[i] &&
					VABSurpriseTrial.length === surpriseIndex &&
					!probes[i]
				) {
					VABSurpriseTrial.push(true);
					numberOfSurprises++;
					lastSurpriseIndex = i;
					noProbe--;
				} else {
					VABSurpriseTrial.push(false);
				}
			} else {
				VABSurpriseTrial.push(false);
			}

			// if (VABSurpriseTrial.length === surpriseIndex && !practice) {
			// 	VABSurpriseTrial.push(true);
			// } else {
			// 	VABSurpriseTrial.push(false);
			// }
		}

		if (VABSurpriseTrial.includes(true)) {
			surprise[i] = true;
		}

		VABLetters.push(VABLettersTrial);
		VABTargets.push(VABTargetsTrial);
		VABTextColors.push(VABTextColorsTrial);
		VABSurprise.push(VABSurpriseTrial);
	}
	// }

	// let count = 10;
	// let valid = surprise.filter((s) => s === true);
	// while (valid.length !== 4 && count > 0) {
	// 	VABLetters = [];
	// 	VABTargets = [];
	// 	VABTextColors = [];
	// 	VABSurprise = [];
	// 	console.log({ surprise });
	// 	console.log({ valid });
	// 	console.log({ count });
	// 	createTrials();
	// 	valid = surprise.filter((s) => s === true);
	// 	count--;
	// }

	// console.log({
	// 	VABLetters,
	// 	VABTargets,
	// 	VABTextColors,
	// 	targetOffsets,
	// 	T1Indices,
	// 	surprise,
	// 	VABSurprise
	// });

	return {
		letters: VABLetters,
		targets: VABTargets,
		textColors: VABTextColors,
		targetOffsets,
		T1Indices,
		surprise,
		surpriseTrial: VABSurprise
	};
}

export function createVABTrials(practice = false, round = 0) {
	let output = helperVAB(practice, round);
	let isSurpriseValid = output.surprise.filter((s) => s === true);
	if (!practice) {
		while (isSurpriseValid.length !== 4) {
			output = helperVAB(practice, round);
			isSurpriseValid = output.surprise.filter((s) => s === true);
			// console.log({ isSurpriseValid });
		}
	}

	return {
		letters: output.letters,
		targets: output.targets,
		textColors: output.textColors,
		targetOffsets: output.targetOffsets,
		T1Indices: output.T1Indices,
		surprise: output.surprise,
		surpriseTrial: output.surpriseTrial
	};
}
