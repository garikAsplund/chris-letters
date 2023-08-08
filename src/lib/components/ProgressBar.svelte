<script>
    export let current;
    export let total;
  
    $: progress = (current / total) * 100;
</script>

<div class=" bg-gray-200 h-6 w-full">
    <div class="bg-blue-500 h-6 progress-inner" style="width: {progress}%"></div>
</div>

<style>
    .progress-inner {
      transition: width 0.5s ease-in-out;
    }
    </style>