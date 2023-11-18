<script>
	import {
		guessed,
		inProgress,
		started,
		startTime,
		numberOfFlashes,
		guesses,
		targetLetter,
		everyAccuracy,
		everyGuess,
		everyReactionTime,
		everyTarget
	} from '$lib/stores/GameStore';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let begin;
	export let isAB;
	export let textSize;

	let pinlength = isAB ? 2 : 1;
	let codeFields = Array(pinlength).fill('');

	const resetValue = (i) => {
		codeFields = codeFields.map((value, index) => (index >= i ? '' : value));
	};

	const stepForward = (i) => {
		if (codeFields[i] && i !== pinlength - 1) {
			codeFields[i + 1] = '';
			resetFieldFocus(i + 1);
		}
		checkPin();
	};

	const stepBack = (i) => {
		if (codeFields[i - 1] && i !== 0) {
			codeFields[i - 1] = '';
			resetFieldFocus(i - 1);
		}
	};

	const resetFieldFocus = (i) => {
		const field = document.getElementById(`codefield_${i}`);
		if (field) field.focus();
	};

	// need to add backspace here and above with a timeout
	function handleKeydown(event) {
		let reactionTime;
		let receivedLetter = ' ';

		if (isAB && !$inProgress) {
			if (event.key && event.key.length === 1) {
				if ($guesses.length < 2) {
					if ($startTime) {
						reactionTime = Date.now() - $startTime;
						$guesses = [...$guesses, event.key.toUpperCase()];
					}
					if ($guesses.length === 2) {
						$guessed = true;
						$startTime = 0;
						$everyReactionTime.push(reactionTime);
						$everyGuess.push(...$guesses);
						$everyTarget.push($targetLetter.split(''));

						if (
							($targetLetter[0] == $guesses[0] && $targetLetter[1] == $guesses[1]) ||
							($targetLetter[0] == $guesses[1] && $targetLetter[1] == $guesses[0])
						) {
							$everyAccuracy = [...$everyAccuracy, 2];
						} else if ($targetLetter.includes($guesses[0]) || $targetLetter.includes($guesses[1])) {
							$everyAccuracy = [...$everyAccuracy, 1];
						} else {
							$everyAccuracy = [...$everyAccuracy, 0];
						}

						console.log(
							{ everyAccuracy: $everyAccuracy },
							{ everyGuess: $everyGuess },
							{ everyReactionTime: $everyReactionTime },
							{ everyTarget: $everyTarget }
						);
						$numberOfFlashes = 1;
						$started = false;
						$targetLetter = '';
						$guesses = [];
						setTimeout(() => {
							$inProgress = true;
						}, 100);
						setTimeout(() => {
							begin();
						}, 900);
					}
				}
			}
		} else if (!$inProgress) {
			if (event.key && event.key.length === 1) {
				if ($startTime) {
					reactionTime = Date.now() - $startTime;
					$everyReactionTime = [...$everyReactionTime, reactionTime];
					$startTime = 0;
					$started = false;
					$numberOfFlashes = 1;
					$guessed = true;
					$inProgress = true;
					receivedLetter = event.key.toUpperCase();
					$everyTarget = [...$everyTarget, $targetLetter];
					receivedLetter === $targetLetter
						? ($everyAccuracy = [...$everyAccuracy, 1])
						: ($everyAccuracy = [...$everyAccuracy, 0]);
					$everyGuess = [...$everyGuess, receivedLetter];

					console.log(
						{ everyAccuracy },
						{ everyGuess: $everyGuess },
						{ everyReactionTime: $everyReactionTime },
						{ everyTarget: $everyTarget }
					);

					const correctGuess = {
						message: 'Nice work!',
						timeout: 2000,
						hideDismiss: true,
						background: 'bg-green-500'
					};
					const wrongGuess = {
						message: 'Not quite. Keep trying!',
						timeout: 2000,
						hideDismiss: true,
						background: 'bg-red-500'
					};

					receivedLetter === $targetLetter
						? toastStore.trigger(correctGuess)
						: toastStore.trigger(wrongGuess);

					$targetLetter = '';

					setTimeout(begin, 900);
				}
			}
		}
	}

	onMount(() => {
		resetFieldFocus(0);
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div transition:fade={{ delay: 125, duration: 350 }}>
	<div
		class="px-2 pb-12 font-sans text-5xl font-thin text-gray-200"
		style="font-size: {textSize}px"
	>
		Please enter your guess
	</div>
	<div class="flex justify-center">
		{#each codeFields as value, i (i)}
			<input
				autofocus={i === 0}
				bind:value
				id={`codefield_${i}`}
				class="flex items-center w-12 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
				maxlength="1"
				on:keyup={() => stepForward(i)}
				on:keydown:backspace={() => stepBack(i)}
				on:focus={() => resetValue(i)}
				inputmode="text"
			/>
		{/each}
	</div>
</div>
