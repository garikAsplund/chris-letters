<script>
	import { db, auth, user } from '$lib/database/firebase';
	import { getDatabase, ref, set, child, get } from 'firebase/database';
	import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
	import ProgressBar from './ProgressBar.svelte';
	import Admin from './Admin.svelte';
	import Instructions from './Instructions.svelte';
	import { currentTrial, isAdmin, isPractice, sessionNumber, age, handedness, gender } from '$lib/stores/GameStore';
	import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
	import { onMount } from 'svelte';
	import { dbController } from '$lib/database/dbController';
	import { prolificStore } from '$lib/stores/prolificStore';

	export let isVAB = false;
	let numberOfTrials;

	isVAB ? numberOfTrials = 28 : numberOfTrials = NUMBER_OF_TRIALS;

	const dbRef = ref(getDatabase());

	const googleProvider = new GoogleAuthProvider();

	let x = 0;
	let y = 0;


	let rotation = 0;

	async function signInWithGoogle() {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;

			const userAlreadyExists = await get(child(dbRef, `users/${user.uid}`))
				.then((snapshot) => {
					if (!snapshot.exists()) {
						console.log('No data available, creating user');
						if (user && user.displayName) {
							writeUserData(user.uid, user.displayName);
						}
					}
				})
				.catch((error) => {
					console.error(error);
				});

			get(child(dbRef, `users/${user.uid}/admin`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						$isAdmin = snapshot.val();
					} else {
						console.log('No admin status available');
					}
				})
				.catch((error) => {
					console.error(error);
				});

			get(child(dbRef, `users/${user.uid}/sessionNumber`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						$sessionNumber = snapshot.val();
						console.log({ $sessionNumber });
					} else {
						console.log('No sessionNumber available');
					}
				})
				.catch((error) => {
					console.error(error);
				});

				dbController.writeParticipantData(user.uid, $gender, $handedness, $age, $prolificStore.PROLIFIC_PID);

		} catch (error) {
			console.error('Error signing in with Google:', error.message);
		}
	}

	onAuthStateChanged(auth, (currentUser) => {
		$isAdmin = false;

		if (currentUser) {
			get(child(dbRef, `users/${currentUser.uid}/admin`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						$isAdmin = snapshot.val();
					}
				})
				.catch((error) => {
					console.error(error);
				});
		}
	});

	async function handleSignOut() {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error signing out:', error.message);
		}
	}

	function writeUserData(userId, displayName) {
		set(ref(db, `users/${userId}`), {
			displayName: displayName,
			admin: false,
			sessionNumber: 1
		});
	}

	function updateHalcyon() {
		x = Math.random() * 2 - 1;
		y = Math.random() * 2 - 1;
		rotation = Math.random() * 1 - 11;
	}

	onMount(() => {
		const interval = setInterval(updateHalcyon, 50);

		setTimeout(() => {
			clearInterval(interval);
		}, 3333);
	});

	let isMobile = window.innerWidth < 800 ? true : false;

	addEventListener('resize', (event) => {});

	onresize = () => {
		window.innerWidth < 800 ? (isMobile = true) : (isMobile = false);
	};
</script>
{#if !isMobile}
{#if !$user}
	<div class="h-screen w-screen">
		<h1
			class=" md:text-6xl text-5xl font-bold text-center items-center transform translate-y-20 m-4"
		>
			<span
				class="experiment text-transparent bg-gradient-to-br to-white from-cyan-300 bg-clip-text box-decoration-clone z-10"
				>Welcome to our experiment</span
			> 🧑‍🔬
		</h1>
		<div class="invisible lg:visible background">
			<img
				class="halcyon"
				src="/lilhalcyon.svg"
				height="300"
				width="300"
				alt="Halcyon!"
				style="transform: translate({-40 + x}px, {-40 + y}px) rotate({rotation}deg); z-index: -10;"
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
				<button class="hover:text-gray-400" on:click={handleSignOut}> Sign out </button>
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
			/* background-image: url('path/to/lilhalcyon.svg'); */
			background-repeat: no-repeat;
			background-size: cover;
			z-index: -1;
		}
</style>
