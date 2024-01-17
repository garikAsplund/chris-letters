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
	// import { getToastStore } from '@skeletonlabs/skeleton';

	// const toastStore = getToastStore();

	export let begin;
	export let practiceBlock = 0;

	let receivedLetter = '';
    let target = true;

	let pinlength = 1;
	let codeFields = Array(pinlength).fill('');
	let probeFields = Array(pinlength).fill('');

	

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

	function handleKeydown(event) {
		let reactionTime;

        console.log($inProgress);
		if (!$inProgress) {
            console.log(event.key)
			if (event.key && event.key.length === 1) {
                console.log('hi');
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
				// 	{ everyReactionTime: $everyReactionTime },
				// 	{ everyTarget: $everyTarget }
				// );

				// if ($isPractice) {
				// 	receivedLetter === $targetLetter
				// 		? toastStore.trigger(correctGuess)
				// 		: toastStore.trigger(wrongGuess);
				// }

				$startTime = 0;
				$started = false;
				$numberOfFlashes = 0;
				$targetLetter = '';
				if (target) setTimeout(() => target = false, 400);
                console.log(event.key.toUpperCase());
                if (event.key.toUpperCase() === 'N' || event.key.toUpperCase() === 'Y') {
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

    if (!$isPractice || practiceBlock === 3) {
		setTimeout(() => {
			target = false;
			setTimeout(() => {
				$guessed = true;
				$startTime = 0;
				$started = false;
				$numberOfFlashes = 0;
				$targetLetter = '';
					}, 2000);
			setTimeout(() => {
				$inProgress = true;
				begin();
			}, 2500);
		}, 2000);
	} else {
		if (practiceBlock === 2) target = false;
		setTimeout(() => {
				$guessed = true;
				$startTime = 0;
				$started = false;
				$numberOfFlashes = 0;
				$targetLetter = '';
					}, 2000);
			setTimeout(() => {
				$inProgress = true;
				begin();
			}, 2500);
	}


</script>

<svelte:window on:keydown={handleKeydown} />


<div transition:fade={{ delay: 75, duration: 350 }} class="-translate-y-12">
	{#if target && practiceBlock !== 2}
    <div class="m-12 text-4xl font-sans font-thin text-gray-200">Target?</div>
	<div class="flex justify-center nospaces">
		{#each codeFields as value, i (i)}
			<input
				autofocus={i === 0}
				bind:value
				id={`codefield_${i}`}
				class="flex items-center w-12 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
				maxlength="1"
				name="codefield"
				inputmode="text"
			/>
		{/each}
	</div>
    {/if}
</div>
{#if !target && practiceBlock !== 1}
<div transition:fade={{ delay: 75, duration: 350 }} class="-translate-y-12">
	<div class="m-12 text-4xl font-sans font-thin text-gray-200">Probe?</div>
	<div class="flex justify-center nospaces">
		{#each probeFields as value, j (j)}
			<input
				autofocus={j === 0}
				bind:value
				id={`probefield_${j}`}
				class="flex items-center w-12 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
				maxlength="1"
				name="probefield"
				inputmode="text"
			/>
		{/each}
	</div>
</div>
{/if}
