<script>
    export let correct;
    export let attempts;
  
    $: accuracy = (correct / attempts) * 100;
</script>

<div class="w-full h-3 bg-red-500 ">
    <div class="h-3 bg-green-500 accuracy-inner" style="width: {accuracy}%"></div>
</div>

<style>
    .accuracy-inner {
      transition: width 0.5s ease-in-out;
    }
</style>