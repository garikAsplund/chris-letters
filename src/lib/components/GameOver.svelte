<script>
	import { correct, incorrect } from '$lib/stores/GameStore';
	import { emojisplosions } from 'emojisplosion';
	import ShortUniqueId from 'short-unique-id';
	import { ref, set } from 'firebase/database';
	import { db } from '$lib/firebase';

	function gameOver() {
		const { cancel } = emojisplosions({
			emojis: ['🎊', '🎉', '🪅', '🎁', '🪩', '✨', '💯', '🔥'],
			interval: 100,
			physics: {
				fontSize: {
					max: 50,
					min: 35
				}
			}
		});
		setTimeout(cancel, 750);
	}

	function writeTrialData(trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime) {
		const uid = new ShortUniqueId();
		const trialId = uid();

		set(ref(db, `blocks/${trialId}`), {
			trialType: trialType,
			targets: everyTarget,
			guesses: everyGuess,
			accuracy: everyAccuracy,
			reactionTime: everyReactionTime
		});
	}

	writeTrialData(1, 1, 1, 1, 1); // Add params from $tore
	gameOver();
</script>

<h1 class="flex justify-center text-5xl font-bold transform translate-y-20">
	Thanks for playing!
	<i class="fa-regular fa-face-laugh m-1" />
</h1>

<div class="flex flex-col items-center">
	<h3 class="w-2/5 text-4xl text-center transform translate-y-44">See you next time.</h3>
</div>
