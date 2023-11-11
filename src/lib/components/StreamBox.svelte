<script>
    import interact from 'interactjs';
    import { onMount }  from 'svelte';
    import { fade } from 'svelte/transition';
    import { LETTERS, NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
    import { ABTrials, CCTrials, SiBTrials, numberOfFlashes, startTime, inProgress, count, refreshRate, isOn, lastTime, currentLetter, textColor, isTarget, targetLetter, boxColor, displayFace, currentTrial } from '$lib/stores/GameStore';
    import GameOver from './GameOver.svelte';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import CheckInput from './CheckInput.svelte';

    const toastStore = getToastStore();

    let receivedLetter = ' ';
    let started = false;
    let guessed = true;
    let reactionTime = 0;

    let AB = false; 
    let CC = false; 
    let SiB = false;
    
    let guesses = ['A'];
    let newGuess = '';
    let buttonText = "Start";
    let clicked = false;
    
    let everyTarget = [];
    let everyGuess = [];
    let everyAccuracy = [];
    let everyReactionTime = [];
    
    let boxText = 280;
    let borderWidth = 8;
    
    let value = 50;
    
    function stream(trialType) {
        const currentTime = performance.now();

        if ($numberOfFlashes > 32) {
            $startTime = Date.now();
            setTimeout(() => {
                $inProgress = false;;
            }, 600);
            $displayFace = false;
            return;
        }

        $count += 1;

        if ($count % (Math.floor(50 / Math.floor(1000 / $refreshRate))) === 0) {
            $isOn = !$isOn;
            $numberOfFlashes += 1;
            
            if ($isOn) {
                $currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                $textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                $isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                if (CC) $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                if (SiB) $displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                    
                if ($isTarget) {
                    $targetLetter += $currentLetter;
                }  
            } else {
                $currentLetter = ' ';
                if (SiB) $displayFace = trialType.surprise[$currentTrial - 1][(($numberOfFlashes - 1) / 2) - 1];   
            }

            $lastTime = currentTime;
        }

        requestAnimationFrame(() => stream(trialType));
    }

    function onClick() {
        buttonText = "Trial already in progress";
        clicked = true;
        setTimeout(begin, 400);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;
        if (!AB && !CC && !SiB) return;
        
        $currentTrial += 1;
        $inProgress = true;
        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];
        $count = 0;

        if (AB) stream($ABTrials);
        if (CC) stream($CCTrials);
        if (SiB) stream($SiBTrials);
    }

    function handleKeydown(event) {
        if (AB && !$inProgress) {
            if (event.key && event.key.length === 1) {
                if (LETTERS.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    if ($startTime) {
                        reactionTime = Date.now() - startTime;
                        guesses = [...guesses, event.key.toUpperCase()];
                    }
                    if (guesses.length === 2) {
                        guessed = true;
                        $startTime = null; 
                        everyReactionTime.push(reactionTime);
                        everyGuess.push(...guesses);
                        everyTarget.push($targetLetter.split(''));
                        
                        if (($targetLetter[0] == guesses[0] && $targetLetter[1] == guesses[1]) || ($targetLetter[0] == guesses[1] && $targetLetter[1] == guesses[0])) {
                            everyAccuracy.push(2);
                        } else if ($targetLetter.includes(guesses[0]) || $targetLetter.includes(guesses[1])) {
                            everyAccuracy.push(1);
                        } else {
                            everyAccuracy.push(0);
                        }                        
                        
                        console.log({everyAccuracy}, {everyGuess}, {everyReactionTime}, {everyTarget});

                        $numberOfFlashes = 1;
                        started = false;
                        $targetLetter = '';
                        $inProgress = true;
                        setTimeout(begin, 600);
                    }
                }
            }
        } else if ((SiB || CC) && !$inProgress) {
            if (event.key && event.key.length === 1) {
                if (LETTERS.includes(event.key.toUpperCase())) {
                    if ($startTime) {
                        reactionTime = Date.now() - $startTime;
                        everyReactionTime.push(reactionTime);
                        $startTime = null; 
                        started = false;
                        $numberOfFlashes = 1;
                        guessed = true;
                        receivedLetter = event.key.toUpperCase();
                        everyTarget.push($targetLetter);
                        receivedLetter === $targetLetter ? everyAccuracy.push(1) : everyAccuracy.push(0);
                        everyGuess.push(receivedLetter);

                        console.log({everyAccuracy}, {everyGuess}, {everyReactionTime}, {everyTarget});
                        
                        const correctGuess = {
                            message: 'Nice work!',
                            timeout: 2000,
                            hideDismiss: true,
                            background: 'bg-green-500',
                        };
                        const wrongGuess = {
                            message: 'Not quite. Keep trying!',
                            timeout: 2000,
                            hideDismiss: true,
                            background: 'bg-red-500',
                        }
                        
                        receivedLetter === $targetLetter ? toastStore.trigger(correctGuess) : toastStore.trigger(wrongGuess);
                        
                        $targetLetter = '';

                        setTimeout(begin, 600);
                    }
                }
            }
        }
    }

    // This will go away after getting logic correct
    function handleCheck(event) {
        if (event.target.checked) {
            switch (event.target.value) {
                case "AB":
                    CC = false;
                    SiB = false;
                    clicked = false;
                    $currentTrial = 0;
                case "CC":
                    AB = false;
                    SiB = false;
                    clicked = false;
                    $currentTrial = 0;
                case "SiB":
                    AB = false;
                    CC = false;
                    clicked = false;
                    $currentTrial = 0;
            }
        }
    }

    onMount(() => {
        const storedBoxText = localStorage.getItem('boxText');
        const storedBorderWidth = localStorage.getItem('borderWidth');
            if (storedBoxText && storedBorderWidth) {
                boxText = parseInt(storedBoxText, 10);
                borderWidth = parseInt(storedBorderWidth, 10);
            }
    });

    const resizableDiv = document.getElementById('resizable-div');

    interact('.resize-handle')
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            modifiers: [
                interact.modifiers.aspectRatio({
                    ratio: 1,
                }),
             ],
        })
        .on('resizemove', (event) => {
            const target = event.target;
            const x = parseFloat(target.getAttribute('data-x')) || 0;
            const y = parseFloat(target.getAttribute('data-y')) || 0;

            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            target.style.transform = `translate(${x}px, ${y}px)`;

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            boxText = Math.floor(event.rect.width);
            borderWidth = Math.floor(event.rect.width * 0.03);

            localStorage.setItem('boxText', boxText.toString());
            localStorage.setItem('borderWidth', borderWidth.toString());
        });
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if $currentTrial <= NUMBER_OF_TRIALS}
    <div class="flex justify-center mx-4 space-x-4 translate-y-12 ">      
        <label>
            <input 
                type=checkbox
                value="AB"
                on:input={handleCheck}
                bind:checked={AB} 
            />
            Attentional blink
        </label>
        <label>
            <input 
                type=checkbox
                value="CC"
                on:input={handleCheck}
                bind:checked={CC}
            />
            Contingent capture
        </label>
        <label>
            <input 
                type=checkbox
                value="SiB"
                on:input={handleCheck}
                bind:checked={SiB}
            />
            Surprise-induced blindness
        </label>
    </div>
    <div class="flex justify-center mx-4 space-x-4 translate-y-24">
        <div id="resizable-div" class={`flex justify-center resize-handle`} style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {$boxColor}">
            <p class={`self-center font-thin text-center font-courier-new`} class:text-red-500={$isTarget} style="color: {$textColor}; font-size: {boxText}px">
                {#if $displayFace}
                    <img src="garik_bw.jpg" alt="Garik!!!">
                {:else}
                    {$currentLetter}
                {/if}
                {#if !AB && !CC && !SiB}
                    <p class="p-2 text-4xl text-gray-200 -translate-y-9">
                        <i class="fa-solid fa-angles-up m-5"></i>
                        <br>
                        Please select an option from above                     
                    </p>
                {:else if !clicked}
                    <button on:click={onClick} class="flex items-center p-12 text-4xl text-gray-800 bg-gray-100 border border-black rounded-sm hover:bg-gray-200">
                        {buttonText}
                    </button>
                {/if}
                {#if AB && !$inProgress}
                    <CheckInput isAB={true} />
                {:else if (CC ||SiB) && !$inProgress}
                    <CheckInput isAB={false} />
                {/if}
            </p>
        </div> 
    </div>
    <div class="flex flex-col items-center mb-64">
        <label class="flex flex-col m-4 text-xl text-center translate-y-32">
            <input type="range" bind:value min="20" max="400"/>
            <br>
            {value} ms
        </label>       
    </div>            
{:else}
    <GameOver />
{/if}