<script>
	import { getScreenRefreshRate } from '$lib/logic/refreshRate';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { refreshRate } from '$lib/stores/GameStore';
	import VABStreamBox from '$lib/components/VABStreamBox.svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { Toast } from '@skeletonlabs/skeleton';
	import { dbController } from '$lib/database/dbController';
	import { user } from '$lib/database/firebase';

	initializeStores();

	setTimeout(() => {
		getScreenRefreshRate(function (FPS) {
			$refreshRate = Math.round(FPS / 5) * 5;
			// console.log(`${FPS} FPS`);
			// console.log($refreshRate);
			dbController.setScreenParams($user.uid, $refreshRate, window.innerWidth, window.innerHeight);
		});
	}, 1000);
</script>

<Toast position="r" />
<AuthCheck isVAB={true}>
	<VABStreamBox />
</AuthCheck>
