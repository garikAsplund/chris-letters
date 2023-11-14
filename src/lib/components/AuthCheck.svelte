<script>
	import { db, auth, user } from '$lib/database/firebase';
	import { getDatabase, ref, set, child, get } from 'firebase/database';
	import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
	import ProgressBar from './ProgressBar.svelte';
	import Admin from './Admin.svelte';
	import Instructions from './Instructions.svelte';
	import { currentTrial, isAdmin } from '$lib/stores/GameStore';
	import { NUMBER_OF_TRIALS } from '$lib/logic/constantsAndHelpers';

	const dbRef = ref(getDatabase());

	const googleProvider = new GoogleAuthProvider();

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
						console.log('No data available');
					}
				})
				.catch((error) => {
					console.error(error);
				});
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
			admin: false
		});
	}
</script>

{#if !$user}
	<h1 class="flex justify-center text-5xl font-bold text-center transform translate-y-16">
		<span
			class="text-transparent bg-gradient-to-br to-white from-cyan-300 bg-clip-text box-decoration-clone"
			>Welcome to our experiment</span
		> 🧑‍🔬
	</h1>

	<Instructions signIn={signInWithGoogle} />
{:else}
	<slot />
	<div class="fixed bottom-0 left-0 w-full backdrop-blur-3xl text-lg">
		{#if $user || $isAdmin}
			<div class="flex flex-col justify-center m-2 space-y-2">
				{#if $isAdmin}
					<Admin />
				{/if}
				<button class="hover:text-gray-400" on:click={handleSignOut}> Sign out </button>
			</div>
		{/if}
		<ProgressBar current={$currentTrial} total={NUMBER_OF_TRIALS} />
	</div>
{/if}
