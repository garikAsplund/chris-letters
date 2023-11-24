<script>
	import { emojisplosions } from 'emojisplosion';
	import { blur, fly } from 'svelte/transition';
	import {
		isComplete,
		currentTrial,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime
	} from '$lib/stores/GameStore';
	import { user } from '$lib/database/firebase';
	import { dbController } from '$lib/database/dbController';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import { onMount } from 'svelte';

	let gender = '';
	let handedness = '';
	let age = '';
	let encounteredProblems = '';
	let problemDescription = '';

	let introPicture = false;
	let questions = false;

	$: isNotValid = !gender || !handedness || !age;

	gameOver();

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

	const submitForm = (userId, gender, handedness, age, problemDescription) => {
		dbController.writeParticipantData(userId, gender, handedness, age, problemDescription);
		$isComplete = true;
	};

	onMount(() => {
		setTimeout(() => {
			introPicture = true;
		}, 30);
		setTimeout(() => {
			introPicture = false;
			questions = true;
		}, 3000);
	});
</script>

<div class="flex justify-center text-5xl font-bold translate-y-16" in:blur={{ duration: 1000 }}>
	<div class="mb-48 space-y-12 text-center">
		{#if introPicture}
			<div
				class="relative w-full overflow-hidden mt-24"
				in:blur={{ duration: 1000 }}
				out:fly={{ duration: 1000, x: -500 }}
			>
				<img
					src="https://imgs.search.brave.com/LvdVh7q_k40_FmRD8kg9gRbNn3aGkmO9nT_TBf2Idzc/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90ZWNo/cHAuY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDExLzA2L3N0/ZXZlLWpvYnMtb25l/LW1vcmUtdGhpbmcu/anBn"
					alt="One last thing"
				/>
			</div>
		{:else if questions}
			<div class="mt-24" in:fly={{ delay: 1000, duration: 1000, x: 500 }}>
				<div class="p-5 mx-auto space-y-6 text-xl card">
					{#if !$isComplete}
						<form
							on:submit|preventDefault={() =>
								submitForm($user?.uid, gender, handedness, age, problemDescription)}
							class="space-y-4"
						>
							<p>Please select your gender:</p>
							<div class="gap-4 px-8 m-3 btn-group">
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
								<div class="gap-4 px-8 m-3 btn-group">
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
								<div class="px-8 m-3 text-lg font-light">
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
								<div class="gap-4 px-8 m-3 btn-group">
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
								<div class="px-8 m-3 text-lg font-light">
									<textarea
										rows="2"
										class="p-2 textarea"
										bind:value={problemDescription}
										placeholder="Tell us what went wrong..."
									/>
								</div>
							{/if}

							<button class="rounded btn variant-filled-warning" type="submit" disabled={isNotValid}
								>Submit</button
							>
						</form>
					{:else}
						<div in:blur={{ duration: 800 }}>
							<h1 class="m-3 h1">You're all done :)</h1>
							<i class="fa-solid fa-champagne-glasses fa-xl" />
							<h3 class="h3">Thank you for participating!</h3>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
