<script>
    import interact from 'interactjs';
    import { onMount }  from 'svelte';
    import { LETTERS, NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
    import { createABTrials } from '$lib/logic/AB';
    import { createCCTrials } from '$lib/logic/CC';
    import { createSiBTrials } from '$lib/logic/SiB';
    import { getScreenRefreshRate } from '$lib/logic/refreshRate';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import GameOver from '$lib/components/GameOver.svelte';
    
    let refreshRate = 60;
    getScreenRefreshRate(function(FPS){
        refreshRate = Math.round(FPS / 5) * 5;
        console.log(`${FPS} FPS`);
        console.log(refreshRate);
    });
    
    let currentLetter = ' ';
    let receivedLetter = ' ';
    let targetLetter = '';
    let targetIndex = 14;
    let isTarget = false;
    let textColor;
    let currentTrial = 0;
    let started = false;
    let guessed = true;
    let reactionTime = 0;
    let startTime = null;
    let AB = false; 
    let CC = false; 
    let SiB = false;
    let guesses = [];
    let surpriseTrials = [];
    let displayFace = false;
    let buttonText = "Start";
    let clicked = false;
    let everyTarget = [];
    let everyGuess = [];
    let everyAccuracy = [];
    let everyReactionTime = [];
    let trialType;
    let boxText = 280;
    let borderWidth = 8;
    let value = 50;
    let numberOfFlashes = 0;
    let inProgress = true;
    let boxColor = 'white';

    const { ABLetters, ABTargets, ABTextColors } = createABTrials();
    const { CCLetters, CCTargets, CCTextColors, CCBoxColors } = createCCTrials();
    const { CCLetters: CC2Letters, CCTargets: CC2Targets, CCTextColors: CC2TextColors, CCBoxColors: CC2BoxColors } = createCCTrials();
    const { SiBLetters, SiBTargets, SiBTextColors, SiBSurprise } = createSiBTrials();
    const { SiBLetters: SiB2Letters, SiBTargets: SiB2Targets, SiBTextColors: SiB2TextColors, SiBSurprise: SiB2Surprise} = createSiBTrials();
    
    // console.log({ABLetters});
    // console.log({ABTargets});
    // console.log({ABTextColors});

    // console.log({CCLetters});
    // console.log({CCTargets});
    // console.log({CCTextColors});
    // console.log({CCBoxColors});
    
    // console.log({CC2Letters});
    // console.log({CC2Targets});
    // console.log({CC2TextColors});
    // console.log({CC2BoxColors});

    // console.log({SiBLetters});
    // console.log({SiBTargets});
    // console.log({SiBTextColors});
    // console.log({SiBSurprise});
    
    // console.log({SiB2Letters});
    // console.log({SiB2Targets});
    // console.log({SiB2TextColors});
    // console.log({SiB2Surprise});

    let count = 0;
    
    function streamAB() {
        const currentTime = performance.now();

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            return;
        }
        
        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
            isOn = !isOn;
            numberOfFlashes++;
            
            if (isOn) {
                console.log('ON ' + (performance.now() - lastTime));
                currentLetter = ABLetters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                textColor = ABTextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = ABTargets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                if (isTarget) {
                    targetLetter += currentLetter;
                }
            } else {
                console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
            }

            lastTime = currentTime;
        }

        requestAnimationFrame(streamAB);
    }

    function streamCC() {
        const currentTime = performance.now();

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            return;
        }
 
        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
            isOn = !isOn;
            numberOfFlashes++;
            
            if (isOn) {
                // console.log('ON ' + (performance.now() - lastTime));
                
                currentLetter = CCLetters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                textColor = CCTextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = CCTargets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                boxColor = CCBoxColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                
                if (isTarget) {
                    targetLetter += currentLetter;
                }
            } else {
                // console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
            }

            lastTime = currentTime;
        }

        requestAnimationFrame(streamCC);
    }

    function streamSiB() {
        const currentTime = performance.now();

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            displayFace = false;
            return;
        }

        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
            isOn = !isOn;
            numberOfFlashes++;
            
            if (isOn) {
                // console.log('ON ' + (performance.now() - lastTime));
                
                currentLetter = SiBLetters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                textColor = SiBTextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = SiBTargets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                displayFace = SiBSurprise[currentTrial - 1][(numberOfFlashes / 2) - 1];
                 
                if (isTarget) {
                    targetLetter += currentLetter;
                }  
            } else {
                // console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
                displayFace = SiBSurprise[currentTrial - 1][((numberOfFlashes - 1) / 2) - 1];   
            }

            lastTime = currentTime;
        }

        requestAnimationFrame(streamSiB);
    }

    let lastTime = performance.now();
    let isOn = true;

    function onClick() {
        buttonText = "Trial already in progress";
        clicked = true;
        setTimeout(begin, 400);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;
        if (!AB && !CC && !SiB) return;
        
        currentTrial++;
        inProgress = true;
        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];
        count = 0;

        if (AB) streamAB();
        if (CC) streamCC();
        if (SiB) streamSiB();
    }

    function handleKeydown(event) {
        if (AB && !inProgress) {
            if (event.key && event.key.length === 1) {
                if (LETTERS.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    // startTime = Date.now();
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        console.log({reactionTime});
                        guesses = [...guesses, event.key.toUpperCase()];
                        console.log({guesses});
                    }
                    if (guesses.length === 2) {
                        guessed = true;
                        startTime = null; 
                        everyReactionTime.push(reactionTime);
                        everyGuess.push(...guesses);
                        everyTarget.push(targetLetter.split(''));
                        
                        if ((targetLetter[0] == guesses[0] && targetLetter[1] == guesses[1]) || (targetLetter[0] == guesses[1] && targetLetter[1] == guesses[0])) {
                            everyAccuracy.push(2);
                        } else if (targetLetter.includes(guesses[0]) || targetLetter.includes(guesses[1])) {
                            everyAccuracy.push(1);
                        } else {
                            everyAccuracy.push(0);
                        }                        
                        
                        console.log({everyAccuracy}, {everyGuess}, {everyReactionTime}, {everyTarget});

                        numberOfFlashes = 1;
                        started = false;
                        targetLetter = '';
                        setTimeout(begin, 600);
                    }
                }
            }
        } else if ((SiB || CC) && !inProgress) {
            if (event.key && event.key.length === 1) {
                if (LETTERS.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        everyReactionTime.push(reactionTime);
                        startTime = null; 
                        started = false;
                        numberOfFlashes = 1;
                        guessed = true;
                        receivedLetter = event.key.toUpperCase();
                        everyTarget.push(targetLetter);
                        receivedLetter === targetLetter ? everyAccuracy.push(1) : everyAccuracy.push(0);
                        targetLetter = '';
                        everyGuess.push(receivedLetter);

                        console.log({everyAccuracy}, {everyGuess}, {everyReactionTime}, {everyTarget});

                        setTimeout(begin, 600);
                    }
                }
            }
        }
    }

    function nextTrial(event) {
        if (guessed === false) return;
        if (event.key == " " && event.key.length === 1) {
            begin();
        }
    } 

    function handleCheck(event) {
        if (event.target.checked) {
            switch (event.target.value) {
                case "AB":
                    CC = false;
                    SiB = false;
                    clicked = false;
                    currentTrial = 0;
                case "CC":
                    AB = false;
                    SiB = false;
                    clicked = false;
                    currentTrial = 0;
                case "SiB":
                    AB = false;
                    CC = false;
                    clicked = false;
                    currentTrial = 0;
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
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-gray-400 bg-no-repeat">
    <head>
        <meta charset="UTF-8" />
        <title>
            Streaming letters
        </title>
    </head>
<body class="bg-gray-400">  
    <AuthCheck>
        {#if currentTrial < NUMBER_OF_TRIALS}
            <div class="flex justify-center mx-4 space-x-4 translate-y-12">      
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
                <div id="resizable-div" class={`flex justify-center resize-handle cursor-pointer`} style="border-width: {borderWidth}px; width: {boxText}px; height: {boxText}px; border-color: {boxColor}">
                    <p class={`self-center font-thin text-center font-courier-new`} class:text-red-500={isTarget} style="color: {textColor}; font-size: {boxText}px">
                        {#if displayFace}
                            <img src="garik_bw.jpg" alt="Garik!!!">
                        {:else}
                            {currentLetter}
                        {/if}
                        {#if !AB && !CC && !SiB}
                            <p class="p-2 text-4xl text-gray-800">
                                Please select an option from above 👆
                            </p>
                        {:else if !clicked}
                            <button on:click={onClick} class="flex items-center p-12 text-4xl text-gray-800 bg-gray-100 border border-black rounded-sm hover:bg-gray-200">
                                {buttonText}
                            </button>
                        {/if}
                        {#if AB && !inProgress}
                            <p class="p-2 text-4xl text-gray-800">
                                Please enter your guesses
                            </p>
                        {:else if (CC ||SiB) && !inProgress}
                            <p class="p-2 text-4xl text-gray-800">
                                Please enter your guess
                            </p>
                        {/if}
                    </p>
                </div> 
            </div>
            <div class="flex flex-col items-center">
                <label class="flex flex-col m-4 text-xl text-center translate-y-32">
                    <input type="range" bind:value min="20" max="400"/>
                    <br>
                    {value} ms
                </label>       
            </div>
        {:else}
            <GameOver />
        {/if}
    </AuthCheck>
</body>
</html>