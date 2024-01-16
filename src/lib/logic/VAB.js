import { randomRange, shuffle } from '$lib/logic/ConstantsAndHelpers';

const NUMBER_OF_TRIALS = 28;
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
const TARGETS = ['D', 'F'];
const PROBE = 'X';

export function createVABTrials() {
	const VABLetters = [];
	const VABTargets = [];
	const VABTextColors = [];
    const VABSurprise = [];

	const targetOffsets = shuffle(Array.from({ length: GCD / 6 }, () => 1)
		.concat(Array.from({ length: GCD / 6 }, () => 2))
		.concat(Array.from({ length: GCD / 6 }, () => 3))
		.concat(Array.from({ length: GCD / 6 }, () => 5))
		.concat(Array.from({ length: GCD / 6 }, () => 7))
		.concat(Array.from({ length: GCD / 6 }, () => 9))
        .slice(0, NUMBER_OF_TRIALS));
        
	const T1Indices = shuffle(Array.from({ length: GCD / 3 }, () => 2)
		.concat(Array.from({ length: GCD / 3 }, () => 3))
		.concat(Array.from({ length: GCD / 3 }, () => 4))
        .slice(0, NUMBER_OF_TRIALS));

	const targets = shuffle(Array.from({ length: GCD / 2 }, () => 'F')
		.concat(Array.from({ length: GCD / 2 }, () => 'D'))
        .slice(0, NUMBER_OF_TRIALS));

    const probes = shuffle(Array.from({ length: NUMBER_OF_TRIALS * 3 / 4 }, () => true)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 4 }, () => false))
        .slice(0, NUMBER_OF_TRIALS));

    const surprise = shuffle(Array.from({ length: 24 }, () => true)
        .concat(Array.from({ length: NUMBER_OF_TRIALS * 6 - 24 }, () => false)));

    const surpriseOffsets = shuffle(Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 2)
		.concat(Array.from({ length: NUMBER_OF_TRIALS / 2 }, () => 6)));

    console.log({targetOffsets, T1Indices, targets, probes, surprise});

	for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
		const VABLettersTrial = [];
		const VABTargetsTrial = [];
		const VABTextColorsTrial = [];
        const VABSurpriseTrial = [];
		const shuffledLetters = shuffle(LETTERS);

		console.log({ shuffledLetters });
		let targetOffset = targetOffsets[i];
        let surpriseOffset = surpriseOffsets[i];

		let T1Index = T1Indices[i];
		let probeIndex = T1Index + targetOffset;
        let surpriseIndex = T1Index + surpriseOffset;

		while (VABLettersTrial.length < 16) {
			if (VABTargetsTrial.length === T1Index) {
				VABTargetsTrial.push(true);
				VABTextColorsTrial.push('red');
				VABLettersTrial.push(targets[i]);
			} else if (probes[i] && VABTargetsTrial.length === probeIndex) {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(PROBE);
			} else {
				VABTargetsTrial.push(false);
				VABTextColorsTrial.push('white');
				VABLettersTrial.push(shuffledLetters[VABLettersTrial.length]);
			}

            if (VABSurpriseTrial.length === surpriseIndex) {
                VABSurpriseTrial.push(true);
            } else {
                VABSurpriseTrial.push(false);
            }
		}

		VABLetters.push(VABLettersTrial);
		VABTargets.push(VABTargetsTrial);
		VABTextColors.push(VABTextColorsTrial);
        VABSurprise.push(VABSurpriseTrial);
	}

	console.log({ VABLetters, VABTargets, VABTextColors, targetOffsets, T1Indices });

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
