<!-- For the VAB, each trial began with the presentation of a white fixation
cross (0.8  0.8) for 500 ms, which became larger (1.0  1.0) and
turned yellow for 750 ms before the start of the rapid serial visual
presentation (RSVP) stream. The RSVP stream consisted of 16 items presented
for 117 ms each (no gap between items). Stimuli consisted of
upper-case letters presented in Courier New Font on a dark 
gray background (Fig. 1). Participants searched the RSVP stream for a target and a
probe. Targets were red letters D or F, whereas the probe was a white
letter X. Distractors were white letters save D, F, X, I, L, O, and Q. No
items were repeated during each trial. A target appeared in every trial at
serial position 3, 4, or 5, whereas the probe appeared only in 75% of
trials. When present, the probe appeared at lags 1, 2, 3, 5, 7, or 9 relative
to the target. The first three lags were expected to be within the AB
window, whereas the last three were expected to be outside it. In a small
percentage of trials (14%), an irrelevant surprise stimulus (randomly
selected from a set of 24 grayscale male faces and 24 colorful objects) was
presented at lags 2 or 6 relative to the target, but as these surprise stimuli
are not relevant to this current study, trials containing surprises were
excluded from the following analyses and are not reported further -->

<!-- Each session contained three blocks of 56 trials each, with the trials presented in a pseudorandom order.
 The 168 trials took approximately 25 ​min to complete, including breaks. 
 Before the main experimental blocks in each session, each participant completed 3 practice blocks of 8 trials each.
  The first block contained targets but no probes; the second block contained probes but no targets;
   and the third block contained both. Before beginning each practice and task block of the auditory task, 
   participants could play the target and probe sounds as many times as desired. -->

<!-- 
	Integrate with resize/instructions


	Tie into database
 -->


<script>
	import interact from 'interactjs';
	import { onMount } from 'svelte';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
    import VABCheckInput from '$lib/components/VABCheckInput.svelte';
	import {
		VABTrials,
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
		everyStreamDuration
	} from '$lib/stores/GameStore';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	

	let VAB = false;
    $isPractice = false;


	let guesses = ['A'];
	let clicked = false;

	let boxText = 280;
    let boxTextClone = boxText;
	let borderWidth = 8;

	let value = 117;
	let streamTime;
	let resizedCard = true;

	function stream(trialType) {
		const currentTime = performance.now();

		if ($numberOfFlashes === 32) {
            $currentLetter = '';
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

		// $isPractice && $isPracticeCount <= 4 ? (value = 100) : (value = 100);

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

		console.log('count modulo:', Math.floor(value / Math.floor(1000 / $refreshRate)))
		
		if ($count % Math.floor(value / Math.floor(1000 / $refreshRate)) === 0) {
			if ($isOn) {
				$currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
                console.log({$currentLetter});
				$textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				$isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				// if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];
				// if (SiB)
				// 	$displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes + 2) / 2 - 1];

				if ($isTarget) {
					$targetLetter += $currentLetter;
				}
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
		// if (trialIndex === 3) return;

		if ($isPracticeCount === 8) {
			$isPractice = false;
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
			
			clicked = false;
			$inProgress = false;
			return;
		}

		if ($isPractice) {
			$isPracticeCount += 1;

		
		}

		if (!$isPractice && clicked) {
		
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
		// if (!AB && !CC && !SiB && resizedCard) onEntry();
		if ($guessed && !$inProgress && resizedCard) onClick();

	}}
/>

<div class="flex flex-col justify-center items-center h-view w-full text-white h-screen">
	<div class="flex justify-center align- h-view w-full text-white">
        {#if !clicked}
            Press any key to begin
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
                        {$currentLetter}
                </p>
            </div>
        {/if}

        {#if !$guessed}
            <VABCheckInput {begin} />
        {/if}
	</div>
	
	<div class="fixed bottom-0 left-0 w-full backdrop-blur-3xl text-lg text-white">
		<ProgressBar current={$currentTrial} total={$isPractice ? 8 : NUMBER_OF_TRIALS} />
	</div>
</div>

