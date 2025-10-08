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
		gender,

		refreshRate

	} from '$lib/stores/GameStore';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import { dbController } from '$lib/database/dbController';
	import { prolificStore } from '$lib/stores/prolificStore';
	import { getScreenRefreshRate } from '$lib/logic/refreshRate';

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

	setTimeout(() => {
		getScreenRefreshRate(function (FPS) {
			$refreshRate = Math.round(FPS / 5) * 5 < 60 ? 60 : Math.round(FPS / 5) * 5;
			console.log(`${$refreshRate} FPS`);
			// Move this to StreamBox?
			// dbController.setScreenParams($user?.uid, $refreshRate, window.innerWidth, window.innerHeight);
		}, false);
	}, 1000);

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

	// --- PROCEED TO STUDY (anonymous sign‑in)
	async function proceedToStudy() {
		try {
			// 1️⃣  sign in anonymously
			const { user: anonUser } = await signInAnonymously(auth);
			const uid = anonUser.uid;

			// 2️⃣  write the same participant fields you do for Google users
			await update(ref(db, `users/${uid}`), {
				gender: $gender ?? null,
				handedness: $handedness ?? null,
				age: $age ?? null,
				prolificIDs: $prolificStore ?? null,
				created: Date.now()
			});

			console.log('Anonymous participant created:', uid);
			dbController.setScreenParams(uid, $refreshRate, window.innerWidth, window.innerHeight);
			$user = anonUser; // allow rest of app to proceed
		} catch (err) {
			console.error('Anonymous sign‑in failed:', err);
		}
	}

	// --- AUTO SIGN‑OUT if anon and no Prolific params
	onMount(async () => {
		await new Promise((resolve) =>
			onAuthStateChanged(auth, (currentUser) => {
				if (currentUser?.isAnonymous && !$prolificStore?.PROLIFIC_PID) {
					console.log('Anon user found without Prolific URL → signing out');
					signOut(auth).catch((e) => console.error(e));
				}
				resolve(true);
			})
		);
	});

	// --- AUTH STATE REACTIONS
	onAuthStateChanged(auth, (currentUser) => {
		$isAdmin = false;

		if (currentUser) {
			const prov = currentUser.providerData[0]?.providerId;
			if (prov === 'google.com' && !currentUser.isAnonymous) {
				$isAdmin = true;
			}

			const pid: string | undefined = ($prolificStore as any)?.PROLIFIC_PID;
			const hasPID: boolean = typeof pid === 'string' && pid.trim().length > 0;

			if (!$isAdmin && hasPID && currentUser.uid) {
				dbController.updateParticipantData(currentUser.uid, $prolificStore);
				dbController.setScreenParams($user?.uid, $refreshRate, window.innerWidth, window.innerHeight);
			} else {
				console.log(
					'Skipping updateParticipantData —',
					'isAdmin:',
					$isAdmin,
					'uid:',
					currentUser.uid,
					'hasPID:',
					hasPID
				);
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
	{#if !$user}
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
			<Instructions signIn={$prolificStore ? proceedToStudy : signInWithGoogle} />
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
