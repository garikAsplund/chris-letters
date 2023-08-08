<script>

</script>

<h1 class="transform translate-y-20 flex justify-center text-4xl font-bold underline">
    Welcome to our experiment :)
</h1>

<div class="flex flex-col items-center">
    <h3 class="text-center transform translate-y-40 text-xl w-2/5">
        Whenever you see a red letter, press that key on your keyboard
    </h3>

    <button on:click={begin} class="bg-gray-100 p-2 border rounded-sm border-black transform translate-y-60 text-4xl">
        Start
    </button>

    <div class="transform translate-y-80">
        <p>place letters here!!</p>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.fuchsia.200);
    }
</style>    