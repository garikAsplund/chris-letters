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
		blockNumber
	} from '$lib/stores/GameStore';
	import GameOver from './GameOver.svelte';
	import CheckInput from './CheckInput.svelte';
	import { dbController } from '$lib/database/dbController';
	import { user } from '$lib/database/firebase';
	import { fade } from 'svelte/transition';
	// import face1 from '/images/surprise/face_1.jpg';
	// import face2 from '/images/surprise/face_2.jpg';
	// import face3 from '/images/surprise/face_3.jpg';
	// import face4 from '/images/surprise/face_4.jpg';
	// import face5 from '/images/surprise/face_5.jpg';
	// import face6 from '/images/surprise/face_6.jpg';
	// import face7 from '/images/surprise/face_7.jpg';
	// import face8 from '/images/surprise/face_8.jpg';
	// import face9 from '/images/surprise/face_9.jpg';
	// import face10 from '/images/surprise/face_10.jpg';
	// import face11 from '/images/surprise/face_11.jpg';
	// import face12 from '/images/surprise/face_12.jpg';
	// import object1 from '/images/surprise/object_1.jpg';
	// import object2 from '/images/surprise/object_2.jpg';
	// import object3 from '/images/surprise/object_3.jpg';
	// import object4 from '/images/surprise/object_4.jpg';
	// import object5 from '/images/surprise/object_5.jpg';
	// import object6 from '/images/surprise/object_6.jpg';
	// import object7 from '/images/surprise/object_7.jpg';
	// import object8 from '/images/surprise/object_8.jpg';
	// import object9 from '/images/surprise/object_9.jpg';
	// import object10 from '/images/surprise/object_10.jpg';
	// import object11 from '/images/surprise/object_11.jpg';
	// import object12 from '/images/surprise/object_12.jpg';

	// import _face1 from '$lib/images/surprise/face_1.avif';
	// import _face2 from '$lib/images/surprise/face_2.avif';
	// import _face3 from '$lib/images/surprise/face_3.avif';
	// import _face4 from '$lib/images/surprise/face_4.avif';
	// import _face5 from '$lib/images/surprise/face_5.avif';
	// import _face6 from '$lib/images/surprise/face_6.avif';
	// import _face7 from '$lib/images/surprise/face_7.avif';
	// import _face8 from '$lib/images/surprise/face_8.avif';
	// import _face9 from '$lib/images/surprise/face_9.avif';
	// import _face10 from '$lib/images/surprise/face_10.avif';
	// import _face11 from '$lib/images/surprise/face_11.avif';
	// import _face12 from '$lib/images/surprise/face_12.avif';
	// import _object1 from '$lib/images/surprise/object_1.avif';
	// import _object2 from '$lib/images/surprise/object_2.avif';
	// import _object3 from '$lib/images/surprise/object_3.avif';
	// import _object4 from '$lib/images/surprise/object_4.avif';
	// import _object5 from '$lib/images/surprise/object_5.avif';
	// import _object6 from '$lib/images/surprise/object_6.avif';
	// import _object7 from '$lib/images/surprise/object_7.avif';
	// import _object8 from '$lib/images/surprise/object_8.avif';
	// import _object9 from '$lib/images/surprise/object_9.avif';
	// import _object10 from '$lib/images/surprise/object_10.avif';
	// import _object11 from '$lib/images/surprise/object_11.avif';
	// import _object12 from '$lib/images/surprise/object_12.avif';

	import { getScreenRefreshRate } from '$lib/logic/refreshRate';
	import { prolificStore } from '$lib/stores/prolificStore';

	let surpriseImages = [
		'/images/surprise/face_1.jpg',
		'/images/surprise/face_2.jpg',
		'/images/surprise/face_3.jpg',
		'/images/surprise/face_4.jpg',
		'/images/surprise/face_5.jpg',
		'/images/surprise/face_6.jpg',
		'/images/surprise/face_7.jpg',
		'/images/surprise/face_8.jpg',
		'/images/surprise/face_9.jpg',
		'/images/surprise/face_10.jpg',
		'/images/surprise/face_11.jpg',
		'/images/surprise/face_12.jpg',
		'/images/surprise/object_1.jpg',
		'/images/surprise/object_2.jpg',
		'/images/surprise/object_3.jpg',
		'/images/surprise/object_4.jpg',
		'/images/surprise/object_5.jpg',
		'/images/surprise/object_6.jpg',
		'/images/surprise/object_7.jpg',
		'/images/surprise/object_8.jpg',
		'/images/surprise/object_9.jpg',
		'/images/surprise/object_10.jpg',
		'/images/surprise/object_11.jpg',
		'/images/surprise/object_12.jpg'
		// 	face1,
		// 	face2,
		// 	face3,
		// 	face4,
		// 	face5,
		// 	face6,
		// 	face7,
		// 	face8,
		// 	face9,
		// 	face10,
		// 	face11,
		// 	face12,
		// 	object1,
		// 	object2,
		// 	object3,
		// 	object4,
		// 	object5,
		// 	object6,
		// 	object7,
		// 	object8,
		// 	object9,
		// 	object10,
		// 	object11,
		// 	object12,
		// _face1,
		// _face2,
		// _face3,
		// _face4,
		// _face5,
		// _face6,
		// _face7,
		// _face8,
		// _face9,
		// _face10,
		// _face11,
		// _face12,
		// _object1,
		// _object2,
		// _object3,
		// _object4,
		// _object5,
		// _object6,
		// _object7,
		// _object8,
		// _object9,
		// _object10,
		// _object11,
		// _object12
	];

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

	// REVERT

	// dbController
	// 	.getTrialOrder()
	// 	.then((index) => {
	// 		trialOrder = trialOrders[index];
	// 		console.log({trialOrder});
	// 	})
	// 	.catch((error) => {
	// 		console.error('An error occurred:', error);
	// 	});

	trialOrder = trialOrders[5];

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

	let surprisePath: string = `${Math.floor(surpriseCount) % 2 == 0 ? 'face' : 'object'}_${
		Math.floor(surpriseCount++ / 2) + 1
	}`;

	// Just requestAnimationFrame() BEST
	function stream(trialType) {
		let timeAccumulator = 0;
		let lastFrameTime = performance.now();

		// Add timing diagnostics
		const timings = [];
		let lastFlashTime = performance.now();

		const baseInterval = $isPractice && $isPracticeCount <= 4 ? 100 : 50;

		function streamFrame(currentTime) {
			const deltaTime = currentTime - lastFrameTime;
			timeAccumulator += deltaTime;

			if ($numberOfFlashes === 32) {
				// Log timing statistics at the end of stream
				const intervals = timings.map((t, i) => (i > 0 ? t - timings[i - 1] : 0)).slice(1);
				const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
				const maxInterval = Math.max(...intervals);
				const minInterval = Math.min(...intervals);
				const jitter = intervals.map((i) => Math.abs(i - baseInterval));
				const avgJitter = jitter.reduce((a, b) => a + b, 0) / jitter.length;

				console.log(`Timing statistics for trial ${$currentTrial}:
                Target interval: ${baseInterval}ms
                Average interval: ${avgInterval.toFixed(2)}ms
                Min interval: ${minInterval.toFixed(2)}ms
                Max interval: ${maxInterval.toFixed(2)}ms
                Average jitter: ${avgJitter.toFixed(2)}ms
                Total duration: ${(currentTime - timings[0]).toFixed(2)}ms
            `);

				$displayFace = false;
				$everyStreamDuration.push(Math.round(currentTime - streamTime));

				setTimeout(() => {
					$startTime = Date.now();
					$inProgress = false;
					$guessed = false;
				}, 100);

				return;
			}

			while (timeAccumulator >= baseInterval) {
				if ($isOn) {
					$currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
					$textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
					$isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];

					if (CC) {
						$boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
					}

					if (SiB) {
						$displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
						if ($displayFace) {
							const imageName = `${Math.floor(surpriseCount) % 2 == 0 ? 'face' : 'object'}_${
								Math.floor(surpriseCount++ / 2) + 1
							}`;
							$everySurprisePath.push(imageName);
							surprisePath = imageName;
						}
					}

					if ($isTarget) {
						$targetLetter += $currentLetter;
					}
				} else {
					$currentLetter = ' ';
					if (CC) {
						$boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 1) / 2 - 1];
					}
					if (SiB) {
						$displayFace = false;
					}
				}

				// Record timing for this flash
				timings.push(performance.now());

				$isOn = !$isOn;
				$numberOfFlashes += 1;
				timeAccumulator -= baseInterval;
			}

			lastFrameTime = currentTime;
			requestAnimationFrame(streamFrame);
		}

		requestAnimationFrame(streamFrame);
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
							$everyStreamDuration
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
							$everySurprisePath
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
					$everyStreamDuration
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
					$everyStreamDuration
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

	const imageUrls = Object.values(surpriseImages);
</script>

<svelte:head>
	{#each imageUrls as imageUrl}
		<link rel="preload" href={imageUrl} as="image" />
	{/each}
</svelte:head>

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
						<p
							class="p-2 font-sans text-3xl text-gray-200 absolute top-6 w-full lg:w-4/5 xl:w-3/4 z-10"
						>
							This step ensures that the letters in the experiment are the correct size.
							<br /><br />
							Please place a standard credit card against your screen and then click on the edge of the
							image to re-size it until they match.
						</p>

						<!-- <p>Prolific PID: {$prolificStore.PROLIFIC_PID}</p>
						<p>Prolific study ID: {$prolificStore.STUDY_ID}</p>
						<p>Prolific session ID: {$prolificStore.SESSION_ID}</p> -->

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
											Please make sure that Night Shift or similar software is disabled 🙏
											<br />
											<br />
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
											Please make sure that Night Shift or similar software is disabled 🙏
											<br />
											<br />
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
				<!-- <p class="text-center align-top mt-5 text-white">{trialOrder[trialIndex]}</p>
 -->
				<div
					class="relative flex justify-center items-center"
					style="border-width: {borderWidth}px;
		   width: {boxText}px;
		   height: {boxText}px;
		   border-color: {$boxColor === 'green' ? 'rgb(0, 200, 0)' : $boxColor};"
				>
					{#if SiB}
						<picture class="absolute inset-0 z-0">
							<img
								src={`/images/surprise/${surprisePath}.jpg`}
								alt="Surprise!!!"
								class="w-full h-full object-cover scale-[0.7]"
								style="opacity: {$displayFace ? 1 : 0};"
							/>
						</picture>
					{/if}
					<p
						class="relative self-center font-thin text-center font-courier-new z-10"
						style="color: {$displayFace && SiB
							? 'transparent'
							: $isTarget
							? $targetColor === 'green'
								? 'rgb(0, 200, 0)'
								: 'red'
							: $textColor};
			   font-size: {boxText}px;"
					>
						{$currentLetter}
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
