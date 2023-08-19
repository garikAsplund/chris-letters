<script>
    import { correct, incorrect } from "$lib/stores/GameStore";
</script>

<h1 class="flex justify-center text-4xl font-bold transform translate-y-20 ">
    😍 Thanks for playing!!! 😎
</h1>

{#if ($correct / ($correct + $incorrect)) > 0.8}
    <h1 class="flex justify-center text-2xl font-bold transform translate-y-32">
        🫨 Wow, way to go!
    </h1>
{:else if ($correct / ($correct + $incorrect)) > 0.65}
    <h1 class="flex justify-center text-2xl font-bold transform translate-y-32">
        👏 You're doing alright.
    </h1>
{:else}
    <h1 class="flex justify-center text-2xl font-bold transform translate-y-32">
        🫣 Keep trying.
    </h1>
{/if}

<div class="flex flex-col items-center">
    <h3 class="w-2/5 text-xl text-center transform translate-y-44">
        See you next time.
    </h3>
</div>