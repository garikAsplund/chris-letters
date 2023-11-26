<script>
	import interact from 'interactjs';
	import { onMount } from 'svelte';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import {
		ABTrials,
		CCTrials,
		SiBTrials,
		CCTrials2,
		SiBTrials2,
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
		sessionNumber
	} from '$lib/stores/GameStore';
	import GameOver from './GameOver.svelte';
	import CheckInput from './CheckInput.svelte';
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
	let trialIndex = 0;

	dbController
		.getTrialOrder()
		.then((index) => {
			trialOrder = trialOrders[index];
		})
		.catch((error) => {
			console.error('An error occurred:', error);
		});

	dbController.getSessionNumber($user.uid).then((number) => {
		$sessionNumber = number;
		// console.log({ $sessionNumber });
	});

	let AB = false;
	let CC = false;
	let SiB = false;

	let blockCount = 1;

	let guesses = ['A'];
	let buttonText = 'Start';
	let clicked = false;

	let boxText = 280;
	let borderWidth = 8;

	let value = 50;
	let streamTime;
	let resizedCard = false;

	function stream(trialType) {
		const currentTime = performance.now();

		if ($numberOfFlashes === 32) {
			setTimeout(() => {
				$startTime = Date.now();
				$inProgress = false;
				$guessed = false;
			}, 100);
			$displayFace = false;
			console.log('Stream length: ', Math.round(performance.now() - streamTime));
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
				buttonText = 'Click to begin';
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
			if (AB) {
				trialIndex += 1;
				$isPractice = true;
				AB = false;
				CC = trialOrder[trialIndex] === 'CC';
				SiB = trialOrder[trialIndex] === 'SiB';
				buttonText = 'Click to practice';
				dbController.writeAB(
					$user.uid,
					$everyTarget,
					$everyGuess,
					$everyAccuracy,
					$everyReactionTime,
					$sessionNumber,
					$ABTrials.letters,
					$ABTrials.T1Indices,
					$ABTrials.targetOffsets,
					$targetColor
				);
				resetDataGathering();
			} else if ((CC || SiB) && blockCount < 2) {
				CC
					? dbController.writeCC(
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
							$targetColor
					  )
					: dbController.writeSiB(
							$user.uid,
							$everyTarget,
							$everyGuess,
							$everyAccuracy,
							$everyReactionTime,
							blockCount,
							$sessionNumber,
							$SiBTrials.letters,
							$SiBTrials.surprise,
							$SiBTrials.targetIndices,
							$targetColor
					  );
				blockCount += 1;
				buttonText = 'Click to begin';
				resetDataGathering();
			} else if (CC || SiB) {
				CC
					? dbController.writeCC(
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
							$targetColor
					  )
					: dbController.writeSiB(
							$user.uid,
							$everyTarget,
							$everyGuess,
							$everyAccuracy,
							$everyReactionTime,
							blockCount,
							$sessionNumber,
							$SiBTrials2.letters,
							$SiBTrials2.surprise,
							$SiBTrials2.targetIndices,
							$targetColor
					  );
				trialIndex += 1;
				$isPractice = true;
				blockCount = 1;
				buttonText = 'Click to practice';
				resetDataGathering();
			}
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
					blockCount === 1 ? stream($SiBTrials) : stream($SiBTrials2);
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
			const x = parseFloat(target.getAttribute('data-x')) || 0;
			const y = parseFloat(target.getAttribute('data-y')) || 0;

			target.style.width = event.rect.width + 'px';
			target.style.height = event.rect.height + 'px';

			target.style.transform = `translate(${x}px, ${y}px)`;

			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);

			boxText = Math.floor(event.rect.width / 7);
			borderWidth = Math.floor((event.rect.width / 7) * 0.03);

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
	<div class="flex justify-center h-view w-view mx-4 space-x-4">
		<div class="translate-y-64">
			{#if !clicked}
				<div class="flex flex-col items-center justify-center -translate-y-32 space-y-16">
					{#if !AB && !CC && !SiB}
						<p class="p-2 font-sans text-3xl text-gray-200">
							Resize this card to be the size of a real life credit card
						</p>

						<div id="resizable-div" class="resize-handle justify-center w-96 h-96">
							<img
								src="https://creditkarma-cms.imgix.net/wp-content/uploads/2023/07/CapitalBank01.png?fm=webp"
								alt="Credit Card"
							/>
						</div>
					{/if}
					{#if resizedCard}
						<div transition:fade={{ delay: 75, duration: 350 }}>
							<p
								class="flex justify-center text-center items-center font-thin text-3xl translate-y-36 font-sans mx-12"
							>
								{#if !AB && !CC && !SiB}
									<p class="-translate-y-64">Great! Press any key to proceed.</p>
								{/if}
								{#if AB}
									{#if $isPractice}
										The first stream will be practice. The first half is slowed down and the second
										half is presented at regular speed.
										<br />
										<br />
										Report the two {$targetColor} letters in each stream when prompted.
										<br />
										<br />
										If you are unsure, please make your best guess.
										<br />
										<br />
										Press any key to begin practice.
									{:else}
										Press any key to continue with the real experiment.
									{/if}
								{/if}
								{#if CC || SiB}
									{#if $isPractice}
										The first stream will be practice with the first half slowed down and the second
										half presented at regular speed.
										<br />
										<br />
										Report the {$targetColor} letter in each stream when prompted.
										<br />
										<br />
										If you are unsure, please make your best guess.
										<br />
										<br />
										Press any key to begin practice.
									{:else if blockCount === 1}
										Press any key to continue with the real experiment.
									{:else}
										Please take a short break.
										<br />
										<br />
										Press any key to continue.
									{/if}
								{/if}
							</p>
						</div>
					{/if}
				</div>
			{/if}
			{#if $inProgress && clicked}
				<div
					class={`flex justify-center`}
					style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {$boxColor}"
				>
					<p
						class={`self-center font-thin text-center font-courier-new`}
						style="color: {$isTarget ? $targetColor : $textColor}; font-size: {boxText}px"
					>
						{#if $displayFace}
							<img src="garik_bw.jpg" alt="Garik!!!" />
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
{#if $sessionNumber > 2}
	<div class="flex justify-center text-5xl font-bold translate-y-16" in:blur={{ duration: 1000 }}>
		<div class="mb-48 space-y-12 text-center">Thank you for participating!</div>
	</div>
{/if}
