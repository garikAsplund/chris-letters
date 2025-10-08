<script lang="ts">
	import { db, auth, user } from '$lib/database/firebase';
	import { ref, set, child, get, update, getDatabase } from 'firebase/database';
	import {
		GoogleAuthProvider,
		signInWithPopup,
		signInAnonymously,
		onAuthStateChanged,
		signOut
	} from 'firebase/auth';
	import { onMount } from 'svelte';
	import ProgressBar from './ProgressBar.svelte';
	import Admin from './Admin.svelte';
	import Instructions from './Instructions.svelte';
	import {
		currentTrial,
		isAdmin,
		isPractice,
		sessionNumber,
		age,
		handedness,
		gender
	} from '$lib/stores/GameStore';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import { dbController } from '$lib/database/dbController';
	import { prolificStore } from '$lib/stores/prolificStore';

	prolificStore.subscribe((v) => console.log('Prolific params:', v));

	export let isVAB = false;
	let numberOfTrials = isVAB ? 28 : NUMBER_OF_TRIALS;

	const googleProvider = new GoogleAuthProvider();
	const dbRef = ref(getDatabase());

	// --- Animate background (unchanged)
	let x = 0,
		y = 0,
		rotation = 0;
	function updateHalcyon() {
		x = Math.random() * 2 - 1;
		y = Math.random() * 2 - 1;
		rotation = Math.random() * 1 - 11;
	}
	onMount(() => {
		const interval = setInterval(updateHalcyon, 50);
		setTimeout(() => clearInterval(interval), 3333);
	});

	// --- GOOGLE SIGN-IN (admins)
	async function signInWithGoogle() {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const userObj = result.user;

			const snapshot = await get(child(dbRef, `users/${userObj.uid}`));
			if (!snapshot.exists()) {
				await set(ref(db, `users/${userObj.uid}`), {
					displayName: userObj.displayName,
					admin: false,
					sessionNumber: 1
				});
			}

			dbController.createParticipantData(userObj.uid, $gender, $handedness, $age, $prolificStore);
		} catch (err) {
			console.error('Google sign-in error:', err);
		}
	}

	// --- ANONYMOUS SIGN‑IN (Prolific participants)
	onMount(async () => {
		const { PROLIFIC_PID, STUDY_ID, SESSION_ID } = $prolificStore;
		if (!PROLIFIC_PID) return;

		const { user: anonUser } = await signInAnonymously(auth);
		const uid = anonUser.uid;

		await update(ref(db, `users/${uid}`), {
			prolificPID: PROLIFIC_PID,
			studyID: STUDY_ID,
			sessionID: SESSION_ID,
			gender: $gender,
			handedness: $handedness,
			age: $age,
			updated: Date.now()
		});

		console.log('Participant stored under uid', uid);
		$user = anonUser; // keep Svelte store in sync
	});

	// --- AUTH STATE REACTIONS
	onAuthStateChanged(auth, (currentUser) => {
		$isAdmin = false;

		if (currentUser) {
			const prov = currentUser.providerData[0]?.providerId;
			if (prov === 'google.com' && !currentUser.isAnonymous) {
				$isAdmin = true;
			}

			if (!$isAdmin && $prolificStore?.PROLIFIC_PID) {
				dbController.updateParticipantData(currentUser.uid, $prolificStore);
			}
		}
	});

	async function handleSignOut() {
		try {
			await signOut(auth);
		} catch (err) {
			console.error('Sign‑out error:', err);
		}
	}

	// --- Responsive check (unchanged)
	let isMobile = window.innerWidth < 800;
	onresize = () => (isMobile = window.innerWidth < 800);
</script>

{#if !isMobile}
	{#if !$user && !$prolificStore?.PROLIFIC_PID}
		<div class="h-screen w-screen">
			<h1 class="md:text-6xl text-5xl font-bold text-center translate-y-20 m-4">
				<span
					class="experiment text-transparent bg-gradient-to-br to-white from-cyan-300 bg-clip-text"
				>
					Welcome to our experiment
				</span> 🧑‍🔬
			</h1>
			<div class="invisible lg:visible background">
				<img
					class="halcyon"
					src="/lilhalcyon.svg"
					height="300"
					width="300"
					alt="Halcyon"
					style="transform: translate({-40 + x}px, {-40 + y}px) rotate({rotation}deg); z-index:-10;"
				/>
			</div>
			<Instructions signIn={signInWithGoogle} />
		</div>
	{:else}
		<slot />
		<div class="fixed bottom-0 left-0 w-full backdrop-blur-3xl text-lg text-white">
			{#if $user || $isAdmin}
				<div class="flex flex-col justify-center m-2 space-y-2">
					{#if $isAdmin}
						<Admin />
					{/if}
					<button class="hover:text-gray-400" on:click={handleSignOut}>Sign out</button>
				</div>
			{/if}
			<ProgressBar current={$currentTrial} total={$isPractice ? 8 : numberOfTrials} />
		</div>
	{/if}
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

<style lang="postcss">
	.experiment {
		animation: hueShift 80s infinite linear;
	}
	@keyframes hueShift {
		0% {
			filter: hue-rotate(0deg);
		}
		100% {
			filter: hue-rotate(360deg);
		}
	}
	.background {
		position: absolute;
		top: 110;
		left: 110;
		width: 100%;
		height: 100%;
		background-repeat: no-repeat;
		background-size: cover;
		z-index: -1;
	}
</style>
