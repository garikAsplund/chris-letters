<script>
	export let current;
	export let total;

	$: progress = (current / total) * 100;
</script>

<div class="w-full h-8">
	<div class="h-8 bg-gray-300 progress-inner" style="width: {progress}%" />
</div>

<style>
	.progress-inner {
		transition: width 0.5s ease-in-out;
	}
</style>
