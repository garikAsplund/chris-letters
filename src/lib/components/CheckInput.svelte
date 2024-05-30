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
		everyTarget,
		isPractice
	} from '$lib/stores/GameStore';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	export let begin;
	export let isAB;

	let receivedLetter = '';

	let pinlength = isAB ? 2 : 1;
	let codeFields = Array(pinlength).fill('');

	const stepForward = (i) => {
		if (codeFields[i] && i !== pinlength - 1) {
			// codeFields[i + 1] = '';
			resetFieldFocus(i + 1);
		}
	};

	const stepBack = (i) => {
		codeFields[i] = '';
		if ($guesses.length === 1) resetFieldFocus(i - 1);
		$guesses.pop();
		setTimeout(() => {
			receivedLetter = '';
		}, 200);
	};

	const resetFieldFocus = (i) => {
		const field = document.getElementById(`codefield_${i}`);
		if (field) field.focus();
	};

	document.addEventListener('click', function(event) {
		const field = document.getElementById(`codefield_0`);
		if (field) field.focus();
	});

	let reactionTimes = [];

	function handleKeydown(event) {
		let reactionTime;
		let reactionTime2;

		if (isAB && !$inProgress) {
			if (event.key && event.key.length === 1) {
				
				if ($guesses.length <= 2) {
					if ($startTime) {
						if (event.key !== 'Backspace' && event.key !== ' ') {
							$guesses = [...$guesses, event.key.toUpperCase()];
							// console.log('guesses: ' + $guesses);
							// codeFields = [...codeFields]; // Ensure reactivity
							codeFields[$guesses.length - 1] = event.key.toUpperCase(); // Update codeFields
						}
						
						if ($guesses.length === 1) {
							reactionTime = Date.now() - $startTime;
							// console.log({reactionTime});
							reactionTimes.push(reactionTime);
							$startTime = Date.now();
						} else {
							reactionTime2 = Date.now() - $startTime;
							// console.log({reactionTime});
							reactionTimes.push(reactionTime2);
						}
					}
					if ($guesses.length === 2) {
						$startTime = 0;
						$everyReactionTime.push(reactionTimes);
						$everyGuess.push([...$guesses]);
						$everyTarget.push($targetLetter.split(''));

						reactionTimes = [];

						const correctGuess = {
							message: '<font size="+2">Nice work!</font>',
							timeout: 2000,
							hideDismiss: true,
							background: 'bg-green-500',
							classes: 'p-12 m-8 w-auto h-18 text-center'
						};

						const halfCorrectGuess = {
							message: '<font size="+2">Half right! Half wrong.</font>',
							timeout: 2000,
							hideDismiss: true,
							background: 'bg-gradient-to-tr from-green-500 to-red-500',
							classes: 'p-12 m-8 w-auto h-18 text-center'
						};

						const wrongGuess = {
							message: '<font size="+2">Not quite. Keep trying!</font>',
							timeout: 2000,
							hideDismiss: true,
							background: 'bg-red-500',
							classes: 'p-12 m-8 w-auto h-18 text-center'
						};
						if (
							($targetLetter[0] == $guesses[0] && $targetLetter[1] == $guesses[1]) ||
							($targetLetter[0] == $guesses[1] && $targetLetter[1] == $guesses[0])
						) {
							$everyAccuracy = [...$everyAccuracy, 2];
							if ($isPractice) toastStore.trigger(correctGuess);
						} else if ($targetLetter.includes($guesses[0]) || $targetLetter.includes($guesses[1])) {
							$everyAccuracy = [...$everyAccuracy, 1];
							if ($isPractice) toastStore.trigger(halfCorrectGuess);
						} else {
							$everyAccuracy = [...$everyAccuracy, 0];
							if ($isPractice) toastStore.trigger(wrongGuess);
						}

						// console.log(
						// 	{ everyAccuracy: $everyAccuracy },
						// 	{ everyGuess: $everyGuess },
							// { everyReactionTime: $everyReactionTime },
						// 	{ everyTarget: $everyTarget }
						// );

						$numberOfFlashes = 0;
						$started = false;
						$targetLetter = '';
						$guesses = [];
						setTimeout(() => {
							$guessed = true;
						}, 200);
						setTimeout(() => {
							$inProgress = true;
							begin();
						}, 1200);
					}
				}
			}
		} else if (!$inProgress) {
			if (event.key && event.key.length === 1 && receivedLetter.length < 1) {
				receivedLetter = event.key.toUpperCase();

				reactionTime = Date.now() - $startTime;
				$everyReactionTime = [...$everyReactionTime, reactionTime];
				$everyGuess = [...$everyGuess, receivedLetter];
				$everyTarget = [...$everyTarget, $targetLetter];

				receivedLetter === $targetLetter
					? ($everyAccuracy = [...$everyAccuracy, 1])
					: ($everyAccuracy = [...$everyAccuracy, 0]);

				const correctGuess = {
					message: '<font size="+2"">Nice work!</font>',
					timeout: 2000,
					hideDismiss: true,
					background: 'bg-green-500',
					classes: 'p-12 m-8 w-auto h-18 text-center',
				};

				const wrongGuess = {
					message: '<font size="+2">Not quite. Keep trying!</font>',
					timeout: 2000,
					hideDismiss: true,
					background: 'bg-red-500',
					classes: 'p-12 m-8 w-auto h-18 text-center'
				};

				// console.log(
				// 	{ everyAccuracy: $everyAccuracy },
				// 	{ everyGuess: $everyGuess },
					// { everyReactionTime: $everyReactionTime },
				// 	{ everyTarget: $everyTarget }
				// );

				if ($isPractice) {
					receivedLetter === $targetLetter
						? toastStore.trigger(correctGuess)
						: toastStore.trigger(wrongGuess);
				}

				$startTime = 0;
				$started = false;
				$numberOfFlashes = 0;
				$targetLetter = '';
				setTimeout(() => {
					$guessed = true;
				}, 200);
				setTimeout(() => {
					$inProgress = true;
					begin();
				}, 1200);
			}
		}
	}

	onMount(() => {
		resetFieldFocus(0);

		document.getElementById('codefield_0')?.addEventListener('input', function (event) {
			if (event.target.value.includes(' ')) {
				event.target.value = event.target.value.replace(/\s/g, '');
			}
		});
		document.getElementById('codefield_1')?.addEventListener('input', function (event) {
			if (event.target.value.includes(' ')) {
				event.target.value = event.target.value.replace(/\s/g, '');
			}
		});
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div transition:fade={{ delay: 75, duration: 350 }} class="-translate-y-12">
	<div class="m-12 text-4xl font-sans font-thin text-gray-200">{isAB ? 'Targets?' : 'Target?'}</div>
	<div class="flex justify-center nospaces">
		{#each codeFields as value, i (i)}
			<input
				autofocus={i === 0}
				bind:value
				id={`codefield_${i}`}
				class="flex items-center w-12 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
				maxlength="1"
				name="codefield"
				on:keyup={(e) => {
					if (e.key !== ' ') stepForward(i);
				}}
				on:keydown={(e) => {
					if (e.key === 'Backspace') {
						stepBack(i);
					}
				}}
				inputmode="text"
			/>
		{/each}
	</div>
</div>
