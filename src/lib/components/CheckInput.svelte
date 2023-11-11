<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let isAB;
    
    let pinlength = isAB ? 2 : 1;
    let codeFields = Array(pinlength).fill('');

    const resetValue = (i) => {
        codeFields = codeFields.map((value, index) => (index >= i ? '' : value));
    };

    const stepForward = (i) => {
        if (codeFields[i] && i !== pinlength - 1) {
            codeFields[i + 1] = '';
            resetFieldFocus(i + 1);
        }
        checkPin();
    };

    const stepBack = (i) => {
        if (codeFields[i - 1] && i !== 0) {
            codeFields[i - 1] = '';
            resetFieldFocus(i - 1);
        }
    };

    const checkPin = () => {
        const code = codeFields.join('').toUpperCase();
        if (code.length === pinlength) {
            validatePin(code);
        }
    };

    const validatePin = (code) => {
        if (code === 'AB') alert('success'); 
    };

    const resetFieldFocus = (i) => {
        const field = document.getElementById(`codefield_${i}`);
        if (field) field.focus();
    };

    onMount(() => {
        resetFieldFocus(0);
    });
</script>
<div in:fade={{ delay: 150, duration: 450 }}>
    <div class="px-2 pb-12 font-sans text-5xl font-thin text-gray-200">
        Please enter your guess
    </div>
    <div class="flex justify-center">
        {#each codeFields as value, i (i)}
            <input
                autofocus={i === 0}
                bind:value
                id={`codefield_${i}`}
                class="flex items-center w-12 h-16 mx-2 text-4xl text-center text-gray-200 uppercase bg-transparent border rounded-lg"
                maxlength="1"
                on:keyup={() => stepForward(i)}
                on:keydown:backspace={() => stepBack(i)}
                on:focus={() => resetValue(i)}
                inputmode="text"  
            />
        {/each}
    </div>
</div>
