<script>
    import ProgressBar from '$lib/components/ProgressBar.svelte';
    import { emojisplosion } from 'emojisplosion';

    const letters = [
        "B",
        "C",
        "D",
        "F",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "R",
        "S",
        "T",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];

    const targets = [
        "D",
        "F",
        "R",
        "X",
    ];

    const distractors = [
        "rgb(0,0,255)",      // blue
        "rgb(200,200,0)",    // yellow
        "rgb(200,0,200)",    // magenta
        "rgb(0,200,200)",    // cyan
        "rgb(200,200,200)",  // light grey
        "rgb(50,50,50)",     // dark grey
    ];

    let currentLetter = ' ';
    let receivedLetter = ' ';
    let showLetter = true;
    let targetLetter = "X";
    let targetIndex = 14;
    let isTarget = false;
    let isBoxRed = false;
    let isBoxGreen = false;
    let textColor;
    let plays = 0;
    let currentTrial = 92;
    const totalTrials = 96;
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

    while (surpriseTrials.length < 6) {
        let trial = randomRange(totalTrials - 2);

        if (surpriseTrials.includes(trial)
            || surpriseTrials.includes(trial - 1)
            || surpriseTrials.includes(trial + 1)) {
            continue;
        }
        
        surpriseTrials.push(trial);
    }

    console.log(surpriseTrials);

    function randomRange(max) {
        return Math.ceil(Math.random() * max);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;

        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];

        let count = 0;
        currentTrial++;
        let boxColor = Math.random() < 0.5 ?  "red" : "green";
        let boxDistance = Math.random() < 0.5 ?  6 : 16;
        targetLetter = targets[plays++ % targets.length];

        let T1Index;
        let T2Index;
        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        
        if (AB) {
            targetIndex = 4;
            T1Index = targetIndex + randomRange(3);
            T2Index = T1Index + targetOffset; 
        }

        if (SiB) {
            targetIndex = 6;
            targetIndex += randomRange(8);
        }

        const flash = setInterval(() => {                
            flashes(count++, boxColor, boxDistance, T1Index, T2Index);
            
            if (count >= 32) clearInterval(flash);
        }, 50);

        setTimeout(() => {
            started = false;
        }, 50 * 32);
    }

    function flashes(count, boxColor, boxDistance, T1Index, T2Index) {
        if (CC === true) {
            if (count === targetIndex * 2) {
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[Math.floor(Math.random() * letters.length)];
            } else {
                currentLetter = ' '; 
            }
        
            let boxIndex = targetIndex * 2 - boxDistance;
            if (boxColor === "green") {
                if (count === boxIndex || count === boxIndex + 1) {
                    isBoxGreen = true;
                } else {
                    isBoxGreen = false;
                }
            }
            if (boxColor === "red") {
                if (count === boxIndex || count === boxIndex + 1) {
                    isBoxRed = true;
                } else {
                    isBoxRed = false;
                } 
            }
        }

        if (AB === true) {
            if (count === T1Index * 2 || count === T2Index * 2) {
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
                targetLetter = targets[plays++ % targets.length];
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[Math.floor(Math.random() * letters.length)];
            } else {
                currentLetter = ' '; 
            }
        }

        if (SiB === true) {
            console.log(targetIndex);
            if (surpriseTrials.includes(currentTrial) && (count === targetIndex * 2 - 6 || count === targetIndex * 2 - 5)) {
                displayFace = true;
            } else if (count === targetIndex * 2) {
                displayFace = false;
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[Math.floor(Math.random() * letters.length)];
            } else {
                currentLetter = ' '; 
            }
        }
        
        showLetter = !showLetter;

        if (currentTrial === 96) {
            const { cancel } = emojisplosion({
                emojis: ["🍕", "🍷", "🙌", "🎆", "🍻", "🎊","🥮", "🏆", "🍾", "🪇", "🥇", "🎇", "🎉", "🪅", "🎁", "🪩", "✨", "🌠", "💯", "🔥", ],
                interval: 40,
                physics: {
                    fontSize: {
                        max: 54,
                        min: 24,
                    },
                },
            });

            setTimeout(cancel, 3000);  
        }
        
    }

    function handleKeydown(event) {
        if (AB) {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    if (startTime || true) {
                        reactionTime = Date.now() - startTime;
                        startTime = null;
                        guesses = [...guesses, event.key.toUpperCase()];
                    }
                    console.log(guesses);
                    if (guesses.length === 2) {
                        guessed = true;
                    }
                }
            }
        } else {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        startTime = null;
                    }
                    guessed = true;
                    receivedLetter = event.key.toUpperCase();
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
                case "CC":
                    AB = false;
                    SiB = false;
                case "SiB":
                    AB = false;
                    CC = false;
            }
        }
    }
</script>
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-gradient-to-b from-fuchsia-300 to-white">
    {#if currentTrial < 96}
        <h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-20 ">
            🪇 Welcome to our experiment 🧑‍🔬
        </h1>
        
        <div class="flex justify-center mx-4 space-x-4 translate-y-32">      
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

        <div class="flex flex-col items-center">
            <h3 class="w-2/5 text-xl text-center transform translate-y-40">
                Whenever you see a red letter, press that key on your keyboard
            </h3>

            <button on:click={begin} class="p-2 text-4xl transform bg-gray-100 border border-black rounded-sm hover:bg-gray-200 translate-y-52">
                Start
            </button>
            <p class="self-center text-lg text-center translate-y-60">Then hit spacebar to start the next trial</p>

            <div class="flex justify-center w-32 h-32 transform border-4 translate-y-80" class:border-red-500={isBoxRed} class:border-green-500={isBoxGreen} class:border-slate-500={!isBoxGreen && !isBoxRed}>
                <p class="self-center font-thin text-center text-8xl font-courier-new" class:text-red-500={isTarget} style="color: {textColor}">
                    {#if displayFace}
                        <img src="garik_bw.jpg" alt="Garik!!!">
                    {:else}
                        {currentLetter}
                    {/if}
                </p>
            </div>
            <p class="self-center text-center text translate-y-96">
                {#if AB}
                    Your guesses:
                {:else}
                    Your guess:
                {/if}
            </p>
            <p class="self-center h-24 font-thin text-center text-8xl font-courier-new translate-y-96">
                {#if AB}
                    {#each guesses as guess}
                        {guess}
                    {/each}
                {:else}
                    {receivedLetter}
                {/if}
            </p>

            <p class="self-center text-center text translate-y-96">Your reaction time:</p>
            <p class="self-center text-2xl font-thin text-center font-courier-new translate-y-96">{reactionTime} ms</p>

            <div class="fixed bottom-0 left-0 w-full">
                <ProgressBar current={currentTrial} total={totalTrials}/>
            </div>
        </div>

    {:else}
        <h1 class="flex justify-center text-4xl font-bold transform translate-y-20 ">
            😍 Thanks for playing!!! 😎
        </h1>

        <div class="flex flex-col items-center">
            <h3 class="w-2/5 text-xl text-center transform translate-y-40">
                See you next time.
            </h3>
        </div>
    {/if}
</html>