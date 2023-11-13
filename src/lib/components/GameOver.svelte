<script>
	import { emojisplosions } from 'emojisplosion';
	import ShortUniqueId from 'short-unique-id';
	import { ref, set } from 'firebase/database';
	import { db } from '$lib/database/firebase';
	import { blur } from 'svelte/transition';
	import { isComplete } from '$lib/stores/GameStore';

	let gender = '';
	let handedness = '';
	let age = '';
	let encounteredProblems = '';
	let problemDescription = '';

	$: isNotValid = !gender || !handedness || !age;

	const submitForm = () => {
		console.log('User Info:', { gender, age: handedness, encounteredProblems, problemDescription });

		gender = '';
		handedness = '';
		age = '';
		encounteredProblems = '';
		problemDescription = '';
		$isComplete = true;
	};

	function handleNumericInput(event) {
		const inputValue = event.target.value;
		const numericValue = inputValue.replace(/\D/g, '');
		age = numericValue;
	}

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

	writeTrialData(1, 1, 1, 1, 1); // Add params from $store
	if (!$isComplete) gameOver();
</script>

<div class="flex justify-center translate-y-16 text-5xl font-bold" in:blur={{ duration: 1000 }}>
	<div class="text-center space-y-12 mb-48">
		<h1 class="h1">
			Thanks for playing!
			<i class="fa-regular fa-face-laugh m-1" />
		</h1>

		<div class="relative overflow-hidden w-full h-72 backdrop-blur-2xl">
			<img
				src="https://imgs.search.brave.com/LvdVh7q_k40_FmRD8kg9gRbNn3aGkmO9nT_TBf2Idzc/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90ZWNo/cHAuY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDExLzA2L3N0/ZXZlLWpvYnMtb25l/LW1vcmUtdGhpbmcu/anBn"
				alt="One last thing"
				class="w-full h-full object-cover object-bottom filter brightness-80 blur-2"
			/>
		</div>

		<div class="card mx-auto p-5 text-xl space-y-6">
			{#if !$isComplete}
			<form on:submit|preventDefault={submitForm} class="space-y-4">
				<p>Please select your gender:</p>
				<div class="btn-group m-3 gap-4 px-8">
					{#each ['Male', 'Female', 'Other', 'Prefer not to say'] as option}
						<input
							type="radio"
							id={option}
							name="gender"
							value={option}
							class="hidden"
							bind:group={gender}
						/>
						<label
							for={option}
							class="btn {gender === option
								? 'variant-filled-primary'
								: 'variant-ghost-primary'} rounded">{option}</label
						>
					{/each}
				</div>

				<label>
					<p>Please select your handedness:</p>
					<div class="btn-group m-3 gap-4 px-8">
						{#each ['Right', 'Left', 'Ambidextrous'] as option}
							<input
								type="radio"
								id={option}
								name="handedness"
								value={option}
								class="hidden"
								required
								bind:group={handedness}
							/>
							<label
								for={option}
								class="btn {handedness === option
									? 'variant-filled-primary'
									: 'variant-ghost-primary'} rounded">{option}</label
							>
						{/each}
					</div>
				</label>

				<label>
					<p>Enter your age:</p>
					<div class="m-3 px-8 text-lg font-light">
						<input
							type="text"
							inputmode="numeric"
							pattern="[0-9]*"
							class="w-16 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
							maxlength="2"
							required
							on:keyup={handleNumericInput}
							bind:value={age}
						/>
					</div>
				</label>

				<label>
					<p>Did you encounter any problems?</p>
					<div class="btn-group m-3 gap-4 px-8">
						<input
							type="radio"
							id="problems-yes"
							name="problems"
							value="yes"
							class="hidden"
							required
							bind:group={encounteredProblems}
						/>
						<label
							for="problems-yes"
							class="btn {encounteredProblems
								? 'variant-filled-primary'
								: 'variant-ghost-primary'} rounded">Yes</label
						>

						<input
							type="radio"
							id="problems-no"
							name="problems"
							value=""
							class="hidden"
							required
							bind:group={encounteredProblems}
						/>
						<label
							for="problems-no"
							class="btn {encounteredProblems
								? 'variant-ghost-primary'
								: 'variant-filled-primary'} rounded">No</label
						>
					</div>
				</label>

				{#if encounteredProblems}
					<div class="m-3 px-8 text-lg font-light">
						<textarea
							rows="2"
							class="textarea p-2"
							bind:value={problemDescription}
							placeholder="Tell us what went wrong..."
						/>
					</div>
				{/if}

				<button class="btn variant-filled-warning rounded" type="submit" disabled={isNotValid}>Submit</button>
			</form>
		{:else}
		<h1 class="h1 m-3">You're all done :)</h1>
		<i class="fa-solid fa-champagne-glasses fa-xl"></i>
		<h3 class="h3">Thank you for participating!</h3>
		{/if}

		</div>
	</div>
</div>
