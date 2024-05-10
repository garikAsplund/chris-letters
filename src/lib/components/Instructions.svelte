<script>
	import { gender, handedness, age } from '$lib/stores/GameStore';
	import { Accordion, AccordionItem, Stepper, Step, SlideToggle } from '@skeletonlabs/skeleton';
	import { fade, fly } from 'svelte/transition';
	import { user } from '$lib/database/firebase';

	let locked = false;
	$: unlocked = !locked;
	export let signIn;

	let isMobile = window.innerWidth < 800 ? true : false;

	$age = '';
	$gender = '';
	$handedness = '';

	addEventListener('resize', (event) => {});

	onresize = () => {
		window.innerWidth < 800 ? (isMobile = true) : (isMobile = false);
	};

	function onCompleteHandler(e) {
		signIn();
	}

	$: isNotValid = !$gender || !$handedness || !$age;

	function handleNumericInput(event) {
		const inputValue = event.target.value;
		const numericValue = inputValue.replace(/\D/g, '');
		$age = numericValue;
	}
</script>

{#if !isMobile}
	<div class="flex justify-center translate-y-8 mt-32">
		<div class="w-3/5 p-4 text-lg mb-36 card text-token">
			<Stepper
				class="m-5 "
				buttonCompleteLabel="Sign in with Google"
				buttonComplete="variant-ghost-warning btn-lg"
				on:complete={onCompleteHandler}
			>
				<Step>
					<svelte:fragment slot="header">Requirements</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
						<p>Please take note of the following requirements for participating in this study:</p>
						<ul class="m-3 list">
							<li>Age 21-35 (18+ for Yale-NUS or NUS students)</li>
							<li>Normal color vision</li>
							<li>Normal or corrected-to-normal vision</li>
							<li>
								Using Google Chrome, Firefox, or Safari browser on a desktop or laptop computer
							</li>
						</ul>
						<p>
							If you do not meet these requirements, you are unfortunately not eligible to
							participate in this experiment.
						</p>
						<p>If you meet these requirements, please continue!</p>
					</div>
				</Step>
				<Step locked={unlocked}>
					<svelte:fragment slot="header">Consent</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
						<p>Thank you for your interest in our study!</p>
						<p>
							Before we begin, we need to obtain your consent to participate. Please read the
							following information. The main task should take approximately 20 minutes and you will
							be reimbursed $3.00 for this time based on our rate.
						</p>
						<Accordion
							autocollapse
							class=" bg-primary-300 bg-opacity-20"
							padding="py-4 px-6"
							regionPanel="bg-primary-100 bg-opacity-10 space-y-6"
							transitionIn={fade}
							transitionInParams={{ duration: 400 }}
						>
							<AccordionItem>
								<svelte:fragment slot="lead"
									><i class="fa-solid fa-circle-info fa-lg" /></svelte:fragment
								>
								<svelte:fragment slot="summary">Study information</svelte:fragment>
								<svelte:fragment slot="content">
									<p>Protocol Title: Target report during rapid serial stimulus presentations</p>
									<p>
										Principal Investigator: Dr. Christopher L. Asplund, Division of Social Sciences,
										Yale-NUS College (tel: +65 6601 3327, e-mail: chris.asplund@yale-nus.edu.sg)
									</p>
								</svelte:fragment>
							</AccordionItem>
							<AccordionItem>
								<svelte:fragment slot="lead"><i class="fa-solid fa-brain fa-lg" /></svelte:fragment>
								<svelte:fragment slot="summary"
									>What is the purpose of this research?</svelte:fragment
								>
								<svelte:fragment slot="content">
									<p>
										You are invited to participate in a research study that investigates the effects
										of various manipulations (instruction, sequential learning, or distraction) on
										working memory and attention in young, healthy individuals. The long-term goal
										of the research is to better understand cognitive limitations and flexibility in
										the domains of visual working memory and attention. This information sheet
										provides you with information about the research.
									</p>
								</svelte:fragment>
							</AccordionItem>
							<AccordionItem>
								<svelte:fragment slot="lead"
									><i class="fa-solid fa-circle-question fa-lg" /></svelte:fragment
								>
								<svelte:fragment slot="summary"
									>What will be done if I take part in this research?</svelte:fragment
								>
								<svelte:fragment slot="content">
									<p>
										You will complete 1 session of a computer-based behavioral task, conducted in a
										location of your choice. You will complete attentional tasks given where your
										response to stimuli is recorded; and depending on the experiment, some
										participants will also be asked to complete brief questionnaires. The entire
										experimental session, including the briefing and consent process, will last no
										more than 20 minutes .
									</p>
									<p>
										You are invited to participate in a research study that investigates the effects
										of various manipulations (instruction, sequential learning, or distraction) on
										working memory and attention in young, healthy individuals. The long-term goal
										of the research is to better understand cognitive limitations and flexibility in
										the domains of visual working memory and attention. This information sheet
										provides you with information about the research.
									</p>
								</svelte:fragment>
							</AccordionItem>
							<AccordionItem>
								<svelte:fragment slot="lead"><i class="fa-solid fa-key fa-lg" /></svelte:fragment>
								<svelte:fragment slot="summary"
									>How will my privacy and the confidentiality of my research records be protected?</svelte:fragment
								>
								<svelte:fragment slot="content">
									<p>
										We never receive identifiable data, all of the identifiers being held with
										Google. Non-identifiable data will be kept for a minimum of 10 years, in
										accordance with National University of Singapore's Research Data Management
										Policy.
									</p>
								</svelte:fragment>
							</AccordionItem>
							<AccordionItem>
								<svelte:fragment slot="lead"
									><i class="fa-solid fa-address-card fa-lg" /></svelte:fragment
								>
								<svelte:fragment slot="summary">Contact info</svelte:fragment>
								<svelte:fragment slot="content">
									<p>
										Please contact the Principal Investigator (Dr. Christopher L. Asplund) at +65
										6601 3327 or chris.asplund@yale-nus.edu.sg for all research-related matters.
									</p>
									<p>
										For an independent opinion regarding the research and the rights of research
										participants, you may contact a staff member of the National University of
										Singapore Institutional Review Board (Attn: Dr. Chan Tuck Wai, at telephone +65
										6516 1234 or e-mail at irb@nus.edu.sg).
									</p></svelte:fragment
								>
							</AccordionItem>
						</Accordion>
						<p class="flex justify-end font-bold">Do you consent to participate?</p>
						<div class="flex justify-end">
							<aside class=" alert variant-ghost-warning">
								<div class="alert-message">
									<p><b>{unlocked ? 'No, I do not' : 'Yes, I do'}</b></p>
								</div>
								<div class="alert-actions">
									<SlideToggle name="locked-state" bind:checked={locked} active="bg-warning-500" />
								</div>
							</aside>
						</div>
					</div>
				</Step>
				<Step>
					<svelte:fragment slot="header">Settings</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
						<p>
							At this time, please take a moment to adjust your browser window so that it takes up
							as much of your screen as possible.
						</p>
						<p>Please position your chair such that your face is roughly 57 cm (or about one arm’s length) away from the screen. Do your best to maintain this position throughout the experiment.</p>
						<p>
							Please also take a moment now to close other browser tabs, silence your phone, etc.,
							so that you are not interrupted by any messages mid-experiment. Finally, please switch
							off any software that might shift the colors of your display (like "Night Shift" in OS
							X).
						</p>
						<p>
							We humbly ask that you complete the study in a single sitting, so please do your best
							to stay focused and attentive throughout. Once you begin, please do not use your
							browser's "Back" button or "Refresh" buttons throughout the study, as this may cause
							errors, or force you to redo certain sections of the study.
						</p>
						<p>
							This experiment lasts approximately 20 minutes and there are 3 short breaks built in.
						</p>
					</div>
				</Step>
				<Step>
					<svelte:fragment slot="header">Instructions</svelte:fragment>
					<div class="space-y-6" in:fly={{ duration: 600, x: 40 }}>
						<p>
							For each trial, you will see a rapid stream of gray letters inside a gray box. Your
							task, for every stream, is to detect the designated target letter, which will be the
							only red letter.
						</p>
						<p>
							After you finish viewing each stream, you will be prompted to type in the target
							letter you saw. Once you input the letter, you will automatically be taken to the next
							trial. Both capital and lowercase letters will be accepted.
						</p>
						<p>If you do not know what the target letter is, please input your best guess.</p>
					</div>
				</Step>
				<Step>
					<svelte:fragment slot="header">Instructions</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
						<p>
							Before you begin the real trials, let's practice the task eight times for you to get
							acquainted with the procedure. For the first four trials, you will be asked to
							practice the task with slower speed. For the next four trials, you will be asked to
							practice the task with normal speed.
						</p>
						<p>
							During the practice trials, feedback (i.e., correct or wrong) will be given after
							answering each question.
						</p>
					</div>
				</Step>
				<Step locked={isNotValid}>
					<svelte:fragment slot="header">Information</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
							<div class="p-5 mx-auto space-y-6 text-xl card">
									<form
										on:submit|preventDefault={() =>
											submitForm($user?.uid, $gender, $handedness, $age)}
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
													bind:group={$gender}
												/>
												<label
													for={option}
													class="btn {$gender === option
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
														bind:group={$handedness}
													/>
													<label
														for={option}
														class="btn {$handedness === option
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
													class="w-16 h-16 mx-2 text-4xl text-center uppercase bg-transparent border border-primary-900 rounded-lg"
													maxlength="2"
													required
													on:keyup={handleNumericInput}
													bind:value={$age}
												/>
											</div>
										</label>
									</form>
							</div>
						</div>
				</Step>
				<Step>
					<svelte:fragment slot="header">Almost there</svelte:fragment>
					<div class="space-y-6 mb-8" in:fly={{ duration: 600, x: 40 }}>
						<p>We will now begin the main experiment.</p>
						<p>The main experiment will consist of 4 blocks with 96 trials in each block.</p>
					</div>
				</Step>
			</Stepper>
		</div>
	</div>
{:else}
	<div class="flex flex-col justify-center items-center">
		<div class="w-3/4 space-y-12 fixed top-1/3 text-primary-50">
			<p class="text-4xl">Oh no, your screen is too small for this study.</p>
			<p class="text-3xl font-light">
				Please move to a larger screen with a keyboard to participate.
			</p>
		</div>
	</div>
{/if}
