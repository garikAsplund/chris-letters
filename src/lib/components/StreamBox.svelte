<script lang="ts">
	import interact from 'interactjs';
	import { onMount } from 'svelte';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import {
		ABTrials,
		CCTrials,
		SiBTrials,
		CCTrials2,
		// SiBTrials2,
		ABPractice,
		CCPractice,
		SiBPractice,
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
		everySurprisePath,
		blockNumber,
	} from '$lib/stores/GameStore';
	import GameOver from './GameOver.svelte';
	import CheckInput from './CheckInput.svelte';
	import { dbController } from '$lib/database/dbController';
	import { user } from '$lib/database/firebase';
	import { fade } from 'svelte/transition';
	import face_1 from '$lib/assets/surprise/face_1.jpg';

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

	const targets = ['red', 'green'];
	dbController
		.getTargetColor()
		.then((index) => {
			// console.log(targets[index]);
			$targetColor = targets[index];
		})
		.catch((error) => {
			console.error('An error occurred:', error);
		});

	const trialOrders = [
		['AB', 'CC', 'SiB'],
		['AB', 'SiB', 'CC'],
		['CC', 'AB', 'SiB'],
		['CC', 'SiB', 'AB'],
		['SiB', 'AB', 'CC'],
		['SiB', 'CC', 'AB']
	];
	let trialOrder;
	let trialIndex: number = 0;
	let surpriseCount: number = 0;

	dbController
		.getTrialOrder()
		.then((index) => {
			trialOrder = trialOrders[index];
			console.log({trialOrder});
		})
		.catch((error) => {
			console.error('An error occurred:', error);
		});

	dbController.getSessionNumber($user.uid).then((number) => {
		$sessionNumber = number;	
		surpriseCount = (number - 1) * 12;

		// console.log({ $sessionNumber, surpriseCount });
	});

	let AB: boolean = false;
	let CC: boolean = false;
	let SiB: boolean = false;

	let blockCount: number = 1;

	let guesses = ['A'];
	let clicked: boolean = false;

	let boxText: number = 280;
	let borderWidth: number = 8;

	let value: number = 50;
	let streamTime;
	let resizedCard: boolean = false;

	let surprisePath: string = `${Math.floor(surpriseCount) % 2 == 0 ? 'face' : 'object'}_${Math.floor(surpriseCount++ / 2) + 1}`;
	// setTimeout(() => console.log({surpriseCount}), 1000);
	let surpriseImages = {
		face_1: face_1,
	};

	function stream(trialType) {
		const currentTime = performance.now();

		if ($numberOfFlashes === 32) {
			setTimeout(() => {
				$startTime = Date.now();
				$inProgress = false;
				$guessed = false;
			}, 100);
			$displayFace = false;
			$everyStreamDuration.push(Math.round(performance.now() - streamTime));
			// console.log('Stream length: ', $everyStreamDuration[$everyStreamDuration.length - 1]);
			return;
		}

		$isPractice && $isPracticeCount <= 4 ? (value = 100) : (value = 50);

		$count += 1;

		if ($count % Math.floor(value / Math.floor(1000 / $refreshRate)) === 0) {
			if ($isOn) {
				$currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				$textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				$isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				if (SiB)
					$displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
					if ($displayFace) {
						const imageName = `${Math.floor(surpriseCount) % 2 == 0 ? 'face' : 'object'}_${Math.floor(surpriseCount++ / 2) + 1}`;
    					$everySurprisePath.push(imageName);
    					surprisePath = imageName;
						console.log({surprisePath});
					}
				if ($isTarget) {
					$targetLetter += $currentLetter;
				}
				
			} else {
				$currentLetter = ' ';
				if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 1) / 2 - 1];
				if (SiB)
					$displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes + 1) / 2 - 1];
			}
			$isOn = !$isOn;
			$numberOfFlashes += 1;
			$lastTime = currentTime;
		}

		requestAnimationFrame(() => stream(trialType));
	}

	function onClick() {
		clicked = true;
		$started = false;
		setTimeout(begin, 400);
	}

	function onEntry() {
		clicked = false;
		$started = false;
		switch (trialOrder[trialIndex]) {
			case 'AB':
				AB = true;
				CC = false;
				SiB = false;
				break;
			case 'CC':
				AB = false;
				CC = true;
				SiB = false;
				break;
			case 'SiB':
				AB = false;
				CC = false;
				SiB = true;
				break;
		}
	}

	function resetDataGathering() {
		$everyTarget = [];
		$everyGuess = [];
		$everyAccuracy = [];
		$everyReactionTime = [];
		$everyStreamDuration = [];
		$everySurprisePath = [];

		console.log('reset data gathering');
	}

	function begin() {
		if ($started) return;
		if (!$guessed) return;
		if (trialIndex === 3) return;

		if ($isPracticeCount === 8) {
			$isPractice = false;
			$isPracticeCount = 0;
			$currentTrial = 0;
			resetDataGathering();

			if (AB || CC || SiB) {
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

		if ($currentTrial > NUMBER_OF_TRIALS) {
			$currentTrial = 0;
			if (AB || SiB) {
				AB
					? dbController.writeAB(
							$user.uid,
							$everyTarget,
							$everyGuess,
							$everyAccuracy,
							$everyReactionTime,
							$sessionNumber,
							$ABTrials.letters,
							$ABTrials.T1Indices,
							$ABTrials.targetOffsets,
							$targetColor,
							$everyStreamDuration,
					  )
					: dbController.writeSiB(
							$user.uid,
							$everyTarget,
							$everyGuess,
							$everyAccuracy,
							$everyReactionTime,
							$sessionNumber,
							$SiBTrials.letters,
							$SiBTrials.surprise,
							$SiBTrials.targetIndices,
							$targetColor,
							$everyStreamDuration,
							$everySurprisePath,
					  );

				trialIndex += 1;
				$blockNumber += 1;
				$isPractice = true;
				AB = trialOrder[trialIndex] === 'AB';
				CC = trialOrder[trialIndex] === 'CC';
				SiB = trialOrder[trialIndex] === 'SiB';
			} else if (CC && blockCount < 2) {
				dbController.writeCC(
					$user.uid,
					$everyTarget,
					$everyGuess,
					$everyAccuracy,
					$everyReactionTime,
					blockCount,
					$sessionNumber,
					$CCTrials.letters,
					$CCTrials.targetOffsets,
					$CCTrials.distractorIndices,
					$CCTrials.distractorColor,
					$targetColor,
					$everyStreamDuration,
				);
				blockCount += 1;
				$blockNumber += 1;
			} else if (CC) {
				dbController.writeCC(
					$user.uid,
					$everyTarget,
					$everyGuess,
					$everyAccuracy,
					$everyReactionTime,
					blockCount,
					$sessionNumber,
					$CCTrials2.letters,
					$CCTrials2.targetOffsets,
					$CCTrials2.distractorIndices,
					$CCTrials2.distractorColor,
					$targetColor,
					$everyStreamDuration,
				);
				trialIndex += 1;
				$blockNumber += 1;
				$isPractice = true;
				blockCount = 1;
				AB = trialOrder[trialIndex] === 'AB';
				CC = trialOrder[trialIndex] === 'CC';
				SiB = trialOrder[trialIndex] === 'SiB';
			}				
			resetDataGathering();
			if (trialIndex === 3) dbController.updateSessionNumber($user.uid);
			clicked = false;
			$inProgress = false;
			return;
		}

		if ($isPractice) {
			$isPracticeCount += 1;

			switch (trialOrder[trialIndex]) {
				case 'AB':
					AB = true;
					CC = false;
					SiB = false;
					stream($ABPractice);
					break;
				case 'CC':
					AB = false;
					CC = true;
					SiB = false;
					stream($CCPractice);
					break;
				case 'SiB':
					AB = false;
					CC = false;
					SiB = true;
					stream($SiBPractice);
					break;
			}
		}

		if (!$isPractice && clicked) {
			switch (trialOrder[trialIndex]) {
				case 'AB':
					AB = true;
					CC = false;
					SiB = false;
					stream($ABTrials);
					break;
				case 'CC':
					AB = false;
					CC = true;
					SiB = false;
					blockCount === 1 ? stream($CCTrials) : stream($CCTrials2);
					break;
				case 'SiB':
					AB = false;
					CC = false;
					SiB = true;
					// blockCount === 1 ? stream($SiBTrials) : stream($SiBTrials2);
					stream($SiBTrials);
					break;
			}
		}
	}

	onMount(() => {
		const storedBoxText = localStorage.getItem('boxText');
		const storedBorderWidth = localStorage.getItem('borderWidth');
		if (storedBoxText && storedBorderWidth) {
			boxText = parseInt(storedBoxText, 10);
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

			boxText = Math.floor(event.rect.width / 5);
			borderWidth = Math.floor((event.rect.width / 5) * 0.05);

			localStorage.setItem('boxText', boxText.toString());
			localStorage.setItem('borderWidth', borderWidth.toString());
		});
</script>

<svelte:window
	on:keydown={() => {
		if (!AB && !CC && !SiB && resizedCard) onEntry();
		else if ($guessed && !$inProgress && resizedCard) onClick();
	}}
/>
{#if trialIndex < 3}
	<div
		class="flex flex-col justify-center items-center h-view w-view space-x-4 text-white h-screen"
	>
		<div class="flex justify-center h-view w-view space-x-4 text-white">
			{#if !clicked}
				<div class="flex flex-col items-center justify-center space-y-16">
					{#if !AB && !CC && !SiB}
						<p class="p-2 font-sans text-3xl text-gray-200 absolute top-6 w-full lg:w-4/5 xl:w-3/4 z-10">
							This step ensures that the letters in the experiment are the correct size.
							<br /><br />
							Please place a standard credit card against your screen and then 
							click on the edge of the image to re-size it until they match.
						</p>

						<div
							id="resizable-div"
							class="resize-handle justify-center items-center w-96 h-96 absolute"
						>
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
								{#if !AB && !CC && !SiB}
									<p class="translate-y-32">Great! Press any key to proceed.</p>
								{/if}
								{#if AB}
									{#if $isPractice}
										<div transition:fade={{ delay: 75, duration: 350 }}>
											Report the two {$targetColor} letters in each stream when prompted.
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
								{#if CC || SiB}
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
								{/if}
							</p>
						</div>
					{/if}
				</div>
			{/if}
			{#if $inProgress && clicked}
				<div
					class="flex justify-center"
					style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {$boxColor === 'green' ? 'rgb(0, 200, 0)' : $boxColor}"
				>
					<p
						class={`self-center font-thin text-center font-courier-new`}
						style="color: {$isTarget ? ($targetColor === 'green' ? 'rgb(0, 200, 0)' : 'red') : $textColor}; font-size: {boxText}px"
					>
						{#if $displayFace}
							<img src={surpriseImages[surprisePath]} alt="Surprise!!!" />
						{:else}
							{$currentLetter}
						{/if}
					</p>
				</div>
			{/if}

			{#if AB && !$guessed}
				<CheckInput {begin} isAB={true} />
			{:else if (CC || SiB) && !$guessed}
				<CheckInput {begin} isAB={false} />
			{/if}
		</div>
	</div>
{:else}
	<GameOver />
{/if}
