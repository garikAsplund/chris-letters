<script>
    import "../app.css";
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
    import { blur } from "svelte/transition";
    import { onMount } from 'svelte';

    console.log(`%c
    ▐▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▌
    ▐ __  __      __       ▌
    ▐/\\ \\/\\ \\  __/\\ \\      ▌
    ▐\\ \\ \\_\\ \\/\\_\\ \\ \\     ▌
    ▐ \\ \\  _  \\/\\ \\ \\ \\    ▌
    ▐  \\ \\ \\ \\ \\ \\ \\ \\_\\   ▌
    ▐   \\ \\_\\ \\_\\ \\_\\/\\_\\  ▌
    ▐    \\/_/\\_\\/_/\\/_/\\_\\ ▌
    ▐▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▌
    `, 'font-family: "Courier New", monospace; font-size: 14px; color: aqua;');



    let ready = false;
    onMount(() => ready = true);
    
    inject({ mode: dev ? 'development' : 'production' });
</script>

<div class="always-visible">
    {#if ready}
    <div class="visible-on-mount" in:blur={{ delay: 250, duration: 1000 }}>
        <slot />
    </div>
    {/if}
</div>