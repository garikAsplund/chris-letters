<script>
	import interact from 'interactjs';
	import { onMount } from 'svelte';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import {
		ABTrials,
		CCTrials,
		SiBTrials,
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
		isPracticeCount
	} from '$lib/stores/GameStore';
	import GameOver from './GameOver.svelte';
	import CheckInput from './CheckInput.svelte';
	import { dbController } from '$lib/database/dbController';

	const targets = ['red', 'green'];
	dbController
		.getTargetColor()
		.then((index) => {
			console.log(targets[index]);
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

	let AB = false;
	let CC = false;
	let SiB = false;

	let guesses = ['A'];
	let buttonText = 'Start';
	let clicked = false;
	let entryButton = true;

	let boxText = 280;
	let borderWidth = 8;

	let value = 50;
	let streamTime;

	function stream(trialType) {
		const currentTime = performance.now();

		if ($numberOfFlashes > 32) {
			setTimeout(() => {
				$startTime = Date.now();
				$inProgress = false;
				$guessed = false;
			}, 600);
			$displayFace = false;
			console.log('Stream length: ', performance.now() - streamTime);
			return;
		}

		$isPractice && $isPracticeCount <= 4 ? (value = 100) : (value = 50);

		$count += 1;

		if ($count % Math.floor(value / Math.floor(1000 / $refreshRate)) === 0) {
			$isOn = !$isOn;
			$numberOfFlashes += 1;

			if ($isOn) {
				$currentLetter = trialType.letters[$currentTrial - 1][$numberOfFlashes / 2 - 1];
				$textColor = trialType.textColors[$currentTrial - 1][$numberOfFlashes / 2 - 1];
				$isTarget = trialType.targets[$currentTrial - 1][$numberOfFlashes / 2 - 1];
				if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][$numberOfFlashes / 2 - 1];
				if (SiB) $displayFace = trialType.surprise[$currentTrial - 1][$numberOfFlashes / 2 - 1];

				if ($isTarget) {
					$targetLetter += $currentLetter;
				}
			} else {
				$currentLetter = ' ';
				if (SiB)
					$displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes - 1) / 2 - 1];
			}

			$lastTime = currentTime;
		}

		requestAnimationFrame(() => stream(trialType));
	}

	function onClick() {
		clicked = true;
		$started = false;
		entryButton = false;
		setTimeout(begin, 400);
	}

	function begin() {
		if ($started) return;
		if (!$guessed) return;
		if (trialIndex === 3) return;
		if ($currentTrial > NUMBER_OF_TRIALS) {
			$currentTrial = 0;
			trialIndex += 1;
			$isPractice = true;
			buttonText = 'Click to practice';
			clicked = false;
			return;
		}
		if ($isPracticeCount === 8) {
			$isPractice = false;
			$isPracticeCount = 0;
			$currentTrial = 0;

			if (AB || CC || SiB) {
				$guessed = true;
				buttonText = 'Click to begin';
				clicked = false;
			}
		}
		console.log({ $isPractice });

		streamTime = performance.now();

		$currentTrial += 1;
		$inProgress = true;
		$started = true;
		$guessed = true;
		guesses = [];
		$count = 0;

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
					stream($CCTrials);
					break;
				case 'SiB':
					AB = false;
					CC = false;
					SiB = true;
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

{#if trialIndex < 3}
	<div class="flex justify-center h-full w-full mx-4 space-x-4">
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
					<button
						on:click={onClick}
						class="p-6 -translate-y-24 font-sans text-5xl text-gray-800 bg-gray-100 border border-black rounded-sm hover:bg-gray-200"
						class:translate-y-36={!entryButton}
					>
						{buttonText}
					</button>
				</div>
			{/if}
			{#if $inProgress && clicked}
				<div
					class={`flex justify-center`}
					style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {$boxColor}"
				>
					<p
						class={`self-center font-thin text-center font-courier-new`}
						class:text-red-500={$isTarget}
						style="color: {$textColor}; font-size: {boxText}px"
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
				<CheckInput {begin} isAB={true} textSize={boxText / 11} />
			{:else if (CC || SiB) && !$guessed}
				<CheckInput {begin} isAB={false} textSize={boxText / 11} />
			{/if}
		</div>
	</div>
{:else}
	<GameOver />
{/if}
