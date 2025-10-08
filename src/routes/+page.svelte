<script>
	import { getScreenRefreshRate } from '$lib/logic/refreshRate';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { refreshRate } from '$lib/stores/GameStore';
	import StreamBox from '$lib/components/StreamBox.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import { dbController } from '$lib/database/dbController';
	import { user } from '$lib/database/firebase';
	import { prolificStore } from '$lib/stores/prolificStore';
	import { onMount } from 'svelte';

	initializeStores();

	setTimeout(() => {
		getScreenRefreshRate(function (FPS) {
			$refreshRate = Math.round(FPS / 5) * 5 < 60 ? 60 : Math.round(FPS / 5) * 5;
			console.log(`${$refreshRate} FPS`);
			dbController.setScreenParams($user?.uid, $refreshRate, window.innerWidth, window.innerHeight);
		}, false);
	}, 1000);

	export let data;
	const { prolificParams } = data;

	onMount(() => {
		if (prolificParams.PROLIFIC_PID) {
			prolificStore.set(prolificParams);
			console.log('Prolific parameters:', prolificParams);
			// Store these values or use them as needed in your app
			// For example, you might want to save them in a Svelte store
			// or use them directly in your components
		} else {
			console.log('Prolific parameters not found in URL');
			// Handle the case where the parameters are not present
		}
	});
</script>

<Toast position="r" />
<AuthCheck>
	{#if $user}
		<StreamBox />
	{/if}
</AuthCheck>
