<script>
	import interact from 'interactjs';
	import { onMount } from 'svelte';
	// import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import {
		ABTrials,
		CCTrials,
		SiBTrials,
		CCTrials2,
		SiBTrials2,
		VABTrials,
		ABPractice,
		CCPractice,
		SiBPractice,
		VABPractice1,
		VABPractice2,
		VABPractice3,
		numberOfFlashes,
		startTime,
		inProgress,
		count,
		refreshRate,
		isOn,
		lastTime,
		currentLetter,
		textColor,
		isTarget,
		targetLetter,
		boxColor,
		displayFace,
		currentTrial,
		started,
		guessed,
		isPractice,
		isPracticeCount,
		everyAccuracy,
		everyTarget,
		everyReactionTime,
		everyGuess,
		targetColor,
		sessionNumber,
		everyStreamDuration,
		probe,
		everyProbeGuess,
		everyProbeAccuracy,
	} from '$lib/stores/GameStore';
	import GameOver from './GameOver.svelte';
	import VABCheckInput from './VABCheckInput.svelte';
	import { dbController } from '$lib/database/dbController';
	import { user } from '$lib/database/firebase';
	import { fade } from 'svelte/transition';

	// console.log({
	// 	$ABTrials,
	// 	$CCTrials,
	// 	$SiBTrials,
	// 	$CCTrials2,
	// 	$SiBTrials2,
	// 	$ABPractice,
	// 	$CCPractice,
	// 	$SiBPractice
	// });

	// const targets = ['red', 'green'];
	// dbController
	// 	.getTargetColor()
	// 	.then((index) => {
	// 		// console.log(targets[index]);
	// 		$targetColor = targets[index];
	// 	})
	// 	.catch((error) => {
	// 		console.error('An error occurred:', error);
	// 	});

	// const trialOrders = [
	// 	['AB', 'CC', 'SiB'],
	// 	['AB', 'SiB', 'CC'],
	// 	['CC', 'AB', 'SiB'],
	// 	['CC', 'SiB', 'AB'],
	// 	['SiB', 'AB', 'CC'],
	// 	['SiB', 'CC', 'AB']
	// ];
	// let trialOrder;
	let trialIndex = 0;

	// dbController
	// 	.getTrialOrder()
	// 	.then((index) => {
	// 		trialOrder = trialOrders[index];
	// 	})
	// 	.catch((error) => {
	// 		console.error('An error occurred:', error);
	// 	});

	// dbController.getSessionNumber($user.uid).then((number) => {
	// 	$sessionNumber = number;
	// 	// console.log({ $sessionNumber });
	// });

	// let AB = false;
	// let CC = false;
	// let SiB = false;
	let VAB = false;

	// let blockCount = 1;
	let practiceBlock = 1;

	let guesses = ['A'];
	let clicked = false;

	let boxText = 280;
    let boxTextClone = boxText;
	let borderWidth = 8;

	let value = 117;
	let streamTime;
	let resizedCard = false;

	const NUMBER_OF_TRIALS = 28;

	function stream(trialType) {
		const currentTime = performance.now();

		if ($numberOfFlashes === 32) {
			setTimeout(() => {
	          $currentLetter = '';
			}, value);

			setTimeout(() => {
				$startTime = Date.now();
				$inProgress = false;
				$guessed = false;
			}, 233);

			$displayFace = false;
			$everyStreamDuration.push(Math.round(performance.now() - streamTime));
			// console.log('Stream length: ', $everyStreamDuration[$everyStreamDuration.length - 1]);
			return;
		}

		// $isPractice && $isPracticeCount <= 4 ? (value = 234) : (value = 117);
		// is this half speed for VAB practice?

		$count += 1;

        if ($count === 1) {
            $currentLetter = '+';
            setTimeout(() => {
                boxTextClone = 1.1 * boxText;
                $textColor = 'yellow';
                setTimeout(() => {
                    boxTextClone = boxText;
                    $textColor = 'white';
                    stream(trialType);
                }, 750);
            }, 500);
        }

		// console.log('count modulo:', Math.floor(value / Math.floor(1000 / $refreshRate)))
		
		if ($count % Math.floor(value / Math.floor(1000 / $refreshRate)) === 0) {
			if ($isOn) {
				$currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
                // console.log({$currentLetter});
				$textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				$isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				// if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				// if (SiB)
				$displayFace = trialType.surprise[$currentTrial - 1] && trialType.surpriseTrial[$currentTrial - 1][($numberOfFlashes  + 2) / 2 - 1];
				// console.log({$displayFace});

				if ($isTarget) {
					$targetLetter += $currentLetter;
					console.log($targetLetter);
				}

				trialType.letters[$currentTrial - 1].includes('X') ? $probe = 'Y' : $probe = 'N';
			}
			$numberOfFlashes += 2;			
			console.log(performance.now() - $lastTime);

			$lastTime = currentTime;		

		}

		if ($count !== 1) requestAnimationFrame(() => stream(trialType));
	}

	function onClick() {
		clicked = true;
		$started = false;
		VAB = true;
		setTimeout(begin, 400);
	}

	function onEntry() {
		clicked = false;
		$started = false;
		VAB = true;
		// switch (trialOrder[trialIndex]) {
		// 	case 'AB':
		// 		AB = true;
		// 		CC = false;
		// 		SiB = false;
		// 		break;
		// 	case 'CC':
		// 		AB = false;
		// 		CC = true;
		// 		SiB = false;
		// 		break;
		// 	case 'SiB':
		// 		AB = false;
		// 		CC = false;
		// 		SiB = true;
		// 		break;
		// }
	}

	function resetDataGathering() {
		$everyTarget = [];
		$everyGuess = [];
		$everyAccuracy = [];
		$everyReactionTime = [];
		$everyStreamDuration = [];

		console.log('reset data gathering');
	}

	function begin() {
		if ($started) return;
		if (!$guessed) return;
		if (trialIndex === 6) return;

		if ($isPracticeCount === 8) {
			practiceBlock += 1;
			practiceBlock < 4 ? $isPractice = true : $isPractice = false;
			$isPracticeCount = 0;
			$currentTrial = 0;
			resetDataGathering();

			if (VAB) {
				$guessed = true;
				$inProgress = false;
				clicked = false;
			}
			return;
		}

		streamTime = performance.now();

		$currentTrial += 1;
		$inProgress = true;
		$started = true;
		$guessed = true;
		guesses = [];
		$count = 0;
		$numberOfFlashes = 0;

		if ($currentTrial > NUMBER_OF_TRIALS) {
			$currentTrial = 0;
			if (VAB) {
				trialIndex += 1;
				$isPractice = true;
				// AB = false;
				// CC = trialOrder[trialIndex] === 'CC';
				// SiB = trialOrder[trialIndex] === 'SiB';
				dbController.writeVAB(
					$user.uid,
					$everyTarget,
					$everyGuess,
					$everyAccuracy,
					$everyReactionTime,
					$sessionNumber,
					$VABTrials.letters,
					$VABTrials.surprise,
					$VABTrials.T1Indices,
					$everyStreamDuration,
					NUMBER_OF_TRIALS,
					$everyProbeGuess,
					$everyProbeAccuracy,
				);
				resetDataGathering();
			} 
			// else if ((CC || SiB) && blockCount < 2) {
			// 	CC
			// 		? dbController.writeCC(
			// 				$user.uid,
			// 				$everyTarget,
			// 				$everyGuess,
			// 				$everyAccuracy,
			// 				$everyReactionTime,
			// 				blockCount,
			// 				$sessionNumber,
			// 				$CCTrials.letters,
			// 				$CCTrials.targetOffsets,
			// 				$CCTrials.distractorIndices,
			// 				$CCTrials.distractorColor,
			// 				$targetColor,
			// 				$everyStreamDuration
			// 		  )
			// 		: dbController.writeSiB(
			// 				$user.uid,
			// 				$everyTarget,
			// 				$everyGuess,
			// 				$everyAccuracy,
			// 				$everyReactionTime,
			// 				blockCount,
			// 				$sessionNumber,
			// 				$SiBTrials.letters,
			// 				$SiBTrials.surprise,
			// 				$SiBTrials.targetIndices,
			// 				$targetColor,
			// 				$everyStreamDuration
			// 		  );
			// 	blockCount += 1;
			// 	resetDataGathering();
			// } else if (CC || SiB) {
			// 	CC
			// 		? dbController.writeCC(
			// 				$user.uid,
			// 				$everyTarget,
			// 				$everyGuess,
			// 				$everyAccuracy,
			// 				$everyReactionTime,
			// 				blockCount,
			// 				$sessionNumber,
			// 				$CCTrials2.letters,
			// 				$CCTrials2.targetOffsets,
			// 				$CCTrials2.distractorIndices,
			// 				$CCTrials2.distractorColor,
			// 				$targetColor,
			// 				$everyStreamDuration
			// 		  )
			// 		: dbController.writeSiB(
			// 				$user.uid,
			// 				$everyTarget,
			// 				$everyGuess,
			// 				$everyAccuracy,
			// 				$everyReactionTime,
			// 				blockCount,
			// 				$sessionNumber,
			// 				$SiBTrials2.letters,
			// 				$SiBTrials2.surprise,
			// 				$SiBTrials2.targetIndices,
			// 				$targetColor,
			// 				$everyStreamDuration
			// 		  );
			// 	trialIndex += 1;
			// 	$isPractice = true;
			// 	// blockCount = 1;
			// 	// AB = trialOrder[trialIndex] === 'AB';
			// 	// CC = trialOrder[trialIndex] === 'CC';
			// 	// SiB = trialOrder[trialIndex] === 'SiB';
			// 	resetDataGathering();
			// }
			if (trialIndex === 3) dbController.updateSessionNumber($user.uid);
			clicked = false;
			$inProgress = false;
			return;
		}

		if ($isPractice) {
			$isPracticeCount += 1;

			// switch (trialOrder[trialIndex]) {
			// 	case 'AB':
			// 		AB = true;
			// 		CC = false;
			// 		SiB = false;
			// 		stream($ABPractice);
			// 		break;
			// 	case 'CC':
			// 		AB = false;
			// 		CC = true;
			// 		SiB = false;
			// 		stream($CCPractice);
			// 		break;
			// 	case 'SiB':
			// 		AB = false;
			// 		CC = false;
			// 		SiB = true;
			// 		stream($SiBPractice);
			// 		break;
			// }
			// console.log(`$VABPractice${practiceBlock}`);
			// stream(`$VABPractice${practiceBlock}`);
			if (practiceBlock === 1) stream($VABPractice1);
			else if (practiceBlock === 2) stream($VABPractice2);
			else if (practiceBlock === 3) stream($VABPractice3);
			// need to make 3 so $VABPractice[i] or something
		}

		if (!$isPractice && clicked) {
			// switch (trialOrder[trialIndex]) {
			// 	case 'AB':
			// 		AB = true;
			// 		CC = false;
			// 		SiB = false;
			// 		stream($ABTrials);
			// 		break;
			// 	case 'CC':
			// 		AB = false;
			// 		CC = true;
			// 		SiB = false;
			// 		blockCount === 1 ? stream($CCTrials) : stream($CCTrials2);
			// 		break;
			// 	case 'SiB':
			// 		AB = false;
			// 		CC = false;
			// 		SiB = true;
			// 		blockCount === 1 ? stream($SiBTrials) : stream($SiBTrials2);
			// 		break;
			// }
			stream($VABTrials);
		}
	}

	onMount(() => {
		const storedBoxText = localStorage.getItem('boxText');
		const storedBorderWidth = localStorage.getItem('borderWidth');
		if (storedBoxText && storedBorderWidth) {
			boxText = parseInt(storedBoxText, 10);
            boxTextClone = boxText;
			borderWidth = parseInt(storedBorderWidth, 10);
		}
	});

	const resizableDiv = document.getElementById('resizable-div');

	interact('.resize-handle')
		.resizable({
			edges: { left: true, right: true, bottom: true, top: true },
			modifiers: [
				interact.modifiers.aspectRatio({
					ratio: 1
				})
			]
		})
		.on('resizemove', (event) => {
			resizedCard = true;
			const target = event.target;

			target.style.width = event.rect.width + 'px';
			target.style.height = event.rect.height + 'px';

			// target.style.transform = `translate(0px, ${event.rect.height / 44}px)`;

			boxText = Math.floor(event.rect.width / 8);
			borderWidth = Math.floor((event.rect.width / 8) * 0.03);

			localStorage.setItem('boxText', boxText.toString());
			localStorage.setItem('borderWidth', borderWidth.toString());
		});
</script>

<svelte:window
	on:keydown={() => {
		if (!VAB && resizedCard) onEntry();
		else if ($guessed && !$inProgress && resizedCard) onClick();
	}}
/>
{#if trialIndex < 6}
<div class="flex flex-col justify-center items-center h-view w-view space-x-4 text-white h-screen">
	<div class="flex justify-center align- h-view w-view space-x-4 text-white">
			{#if !clicked}
				<div class="flex flex-col items-center justify-center space-y-16">
					{#if !VAB}
						<p class="p-2 font-sans text-3xl text-gray-200 absolute -translate-y-72">
							Resize this card to be the size of a real life credit card
						</p>

						<div id="resizable-div" class="resize-handle justify-center items-center w-96 h-96 absolute">
							<img
								src="https://creditkarma-cms.imgix.net/wp-content/uploads/2023/07/CapitalBank01.png?fm=webp"
								alt="Credit Card"
							/>
						</div>
					{/if}
					{#if resizedCard}
						<div transition:fade={{ delay: 75, duration: 350 }}>
							<p
								class="flex justify-center text-center items-center font-thin text-3xl font-sans mx-12"
							>
								{#if !VAB}
									<p class="translate-y-32">Great! Press any key to proceed.</p>
								{/if}
								{#if VAB}
									{#if $isPractice && practiceBlock === 1}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Report the red letter in each stream when prompted.
											<br />
											<br />
											If you are unsure, please make your best guess.
											<br />
											<br />
											Press any key to begin practice.
										</div>
									{:else if $isPractice && practiceBlock === 2}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Report whether the letter 'X' is present in each stream when prompted.
											<br />
											<br />
											If you are unsure, please make your best guess.
											<br />
											<br />
											Press any key to begin practice.
										</div>
									{:else if $isPractice && practiceBlock === 3}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Report the red letter in each stream and if there is the letter 'X' when prompted.
											<br />
											<br />
											If you are unsure, please make your best guess.
											<br />
											<br />
											Press any key to begin practice.
										</div>
									{:else}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Press any key to continue with the real experiment.
										</div>
									{/if}
								{/if}
								<!-- {#if CC || SiB}
									{#if $isPractice}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Report the {$targetColor} letter in each stream when prompted.
											<br />
											<br />
											If you are unsure, please make your best guess.
											<br />
											<br />
											Press any key to begin practice.
										</div>
									{:else if blockCount === 1}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Press any key to continue with the real experiment.
										</div>
									{:else}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Please take a short break.
											<br />
											<br />
											Press any key to continue.
										</div>
									{/if}
								{/if} -->
							</p>
						</div>
					{/if}
				</div>
			{/if}
			{#if $inProgress && clicked}
            <div
                class="flex justify-center"
                style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {$boxColor}"
            >
                <p
                    class={`self-center font-thin text-center font-courier-new`}
                    style="color: {$textColor}; font-size: {boxTextClone}px"
                >
				{#if $displayFace}
					<img src="garik_bw.jpg" alt="Garik!!!" />
				{:else}
					{$currentLetter}
				{/if}
                </p>
            </div>
        {/if}
        {#if !$guessed}
            <VABCheckInput {begin} {practiceBlock} />
        {/if}
</div>
</div>
{:else}
	<GameOver />
{/if}
