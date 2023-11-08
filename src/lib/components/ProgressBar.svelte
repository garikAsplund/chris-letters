<script>
    export let current;
    export let total;
  
    $: progress = (current / total) * 100;
</script>

<div class="w-full h-6 bg-gray-200 ">
    <div class="h-6 bg-blue-500 progress-inner" style="width: {progress}%"></div>
</div>

<style>
    .progress-inner {
      transition: width 0.5s ease-in-out;
    }
</style>