<script>
	import { isPractice, blockNumber, currentTrial } from "$lib/stores/GameStore";
  
	export let current;
	export let total;
  
	$: progress = (current / total) * 100;
  </script>
  
  <div class="w-full h-8 relative">
	<div class="h-8 bg-gray-300 progress-inner" style="width: {progress}%"></div>
	<p class="text-center text-md absolute inset-0 flex items-center justify-center"   style="{$currentTrial === 0 ? 'visibility: hidden' : ''}">
	  {$isPractice ? 'Practice block' : 'Block'} {$blockNumber} of 4
	</p>
  </div>
  
  <style>
	.progress-inner {
	  transition: width 0.5s ease-in-out;
	}
  </style>