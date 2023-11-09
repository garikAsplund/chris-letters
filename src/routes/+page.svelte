<script>
    import { getScreenRefreshRate } from '$lib/logic/refreshRate';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
    import { refreshRate } from '$lib/stores/GameStore';
    import StreamBox from '$lib/components/StreamBox.svelte';
    import { initializeStores } from '@skeletonlabs/skeleton';
    import { Toast } from '@skeletonlabs/skeleton';

    initializeStores();

    setTimeout(() => {
        getScreenRefreshRate(function(FPS){
        $refreshRate = Math.round(FPS / 5) * 5;
        console.log(`${FPS} FPS`);
        console.log($refreshRate);
    })}, 400);
</script>

<Toast position="t" />
<AuthCheck>
    <StreamBox />
</AuthCheck>