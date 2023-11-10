<script>
    export let current;
    export let total;
  
    $: progress = (current / total) * 100;
</script>

<div class="w-full h-6 ">
    <div class="h-6 bg-teal-500 progress-inner" style="width: {progress}%"></div>
</div>

<style>
    .progress-inner {
      transition: width 0.5s ease-in-out;
    }
</style>