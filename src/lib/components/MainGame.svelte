<script>
    import ProgressBar from "./ProgressBar.svelte";
    import AccuracyBar from "./AccuracyBar.svelte";

    import { adminPlay } from "$lib/stores/AdminStore";
    import { game } from "$lib/stores/GameStore";

    function gameOver() {
        const { cancel } = emojisplosions({
                emojis: ["🍕", "🍷", "🙌", "🎆", "🍻", "🎊","🥮", "🏆", "🍾", "🪇", "🥇", "🎇", "🎉", "🪅", "🎁", "🪩", "✨", "🌠", "💯", "🔥", ],
                interval: 40,
                physics: {
                    fontSize: {
                        max: 54,
                        min: 24,
                    },
                },
            });
            setTimeout(cancel, 2000); 
    } 


    while (surpriseTrials.length < 6) {
        let trial = randomRange(game.totalTrials - 2);

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

    function onClick() {
        buttonText = "Trial already in progress";
        clicked = true;
        setTimeout(begin, 400);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;
        if (!AB && !CC && !SiB) return;
        if (++currentTrial === game.totalTrials) {
            gameOver();  
            writeTrialData(trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime);
            // return;
        }

        started = true;
        guessed = false;
        $game.receivedLetter = ' ';
        guesses = [];

        let count = 0;
        let boxColor;
        let T1Index;
        let T2Index;
        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        $game.targetLetter = game.targets[randomRange(game.targets.length) - 1];
        $game.targetLetters = [];
        
        if (AB) {
            trialType = "AB";
            $game.targetLetters.push($game.targetLetter);
            $game.targetIndex = 4;
            T1Index = $game.targetIndex + randomRange(3);
            T2Index = T1Index + targetOffset; 
        }

        if (CC) {
            trialType = "CC";
            $game.boxIndex = 4;
            $game.boxIndex += randomRange(3);
            $game.boxIndex *= 2;
            targetOffset *= 2;
            boxColor = Math.random() < 0.5 ?  "red" : "green";
        }

        if (SiB) {
            trialType = "SiB";
            $game.targetIndex = 6;
            $game.targetIndex += randomRange(8);
        }

        const flash = setInterval(() => {                
            flashes(count++, boxColor, targetOffset, T1Index, T2Index);
            
            if (count >= 32) clearInterval(flash);
        }, isPractice ? 50 * 2 : 50);

        setTimeout(() => {
            started = false;
        }, isPractice ? 50 * 32 * 2 : 50 * 32);
    }

    function flashes(count, boxColor, targetOffset, T1Index, T2Index) {
        if (AB) {
            if (count === T1Index * 2 || count === T2Index * 2) {
                everyTarget.push($game.targetLetter);
                $game.currentLetter = $game.targetLetter;
                $game.isTarget = true;
                textColor = "red";
                startTime = Date.now();
                $game.targetLetter = game.targets[randomRange(game.targets.length) - 1];
                $game.targetLetters.push($game.targetLetter);
            } else if ($game.showLetter) {
                $game.isTarget = false;
                textColor = game.distractors[randomRange(6)];
                $game.currentLetter = game.letters[randomRange(game.letters.length) - 1];
            } else {
                $game.currentLetter = ' '; 
            }
        }

        if (CC) {
            if (count === $game.boxIndex + targetOffset) {
                everyTarget.push($game.targetLetter);
                $game.currentLetter = $game.targetLetter;
                $game.isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if ($game.showLetter) {
                $game.isTarget = false;
                textColor = game.distractors[randomRange(6)];
                $game.currentLetter = game.letters[randomRange(game.letters.length) - 1];
            } else {
                $game.currentLetter = ' '; 
            }
        
            if (boxColor === "green") {
                if (count === $game.boxIndex || count === $game.boxIndex + 1) {
                    isBoxGreen = true;
                } else {
                    isBoxGreen = false;
                }
            }
            if (boxColor === "red") {
                if (count === $game.boxIndex || count === $game.boxIndex + 1) {
                    isBoxRed = true;
                } else {
                    isBoxRed = false;
                } 
            }
        }

        if (SiB) {
            if (surpriseTrials.includes(currentTrial) && (count === $game.targetIndex * 2 - 6 || count === $game.targetIndex * 2 - 5)) {
                displayFace = true;
            } else if (count === $game.targetIndex * 2) {
                everyTarget.push($game.targetLetter);
                displayFace = false;
                $game.currentLetter = $game.targetLetter;
                $game.isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if ($game.showLetter) {
                $game.isTarget = false;
                textColor = game.distractors[randomRange(6)];
                $game.currentLetter = game.letters[randomRange(game.letters.length) - 1];
            } else {
                $game.currentLetter = ' '; 
            }
        }
        
        $game.showLetter = !$game.showLetter;
    }

    function handleKeydown(event) {
        if (AB) {
            if (event.key && event.key.length === 1) {
                if (game.letters.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        guesses = [...guesses, event.key.toUpperCase()];
                    }
                    if (guesses.length === 2) {
                        guessed = true;
                        startTime = null; 
                        everyReactionTime.push(reactionTime);
                        everyGuess.push(...guesses);
                        
                        if ($game.targetLetters.includes(guesses[0]) && $game.targetLetters.includes(guesses[1])) {
                            $game.correct += 2;
                            everyAccuracy.push(2);
                        } else if ($game.targetLetters.includes(guesses[0]) || $game.targetLetters.includes(guesses[1])) {
                            $game.correct++;
                            $game.incorrect++;
                            everyAccuracy.push(1);
                        } else {
                            $game.incorrect += 2;
                            everyAccuracy.push(0);
                        }
                    }
                }
            }
        } else {
            if (event.key && event.key.length === 1) {
                if (game.letters.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        everyReactionTime.push(reactionTime);
                        startTime = null; 
                        guessed = true;
                        $game.receivedLetter = event.key.toUpperCase();
                        $game.receivedLetter === $game.targetLetter ? $game.correct++ : $game.incorrect++;
                        $game.receivedLetter === $game.targetLetter ? everyAccuracy.push(1) : everyAccuracy.push(0);
                        everyGuess.push($game.receivedLetter);
                        setInterval(() => {
                            if (!started) {
                                setTimeout(begin, 600);
                            }
                        }, 20);
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
                case "CC":
                    AB = false;
                    SiB = false;
                    clicked = false;
                case "SiB":
                    AB = false;
                    CC = false;
                    clicked = false;
            }
        }
    }

</script>

<h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-10">
    🪇 Welcome to our experiment 🧑‍🔬
</h1>

<div class="flex justify-center mx-4 space-x-4 translate-y-24">      
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
    {#if !AB && !CC && !SiB}
        <p class="p-2 text-4xl translate-y-32">
            Please select an option from above 👆
        </p>
    {:else if !clicked}
        <button on:click={onClick} class="p-2 text-4xl transform translate-y-32 bg-gray-100 border border-black rounded-sm hover:bg-gray-200">
            {buttonText}
        </button>
    {:else}
        <p class="p-2 text-4xl text-transparent translate-y-32">Shhh, this is secret!!!</p>
    {/if}
    <h3 class="w-2/5 text-xl text-center transform translate-y-40">
        Whenever you see a red letter, press that key on your keyboard
    </h3>

    <label class="m-4 translate-y-40">
        <input 
            type=checkbox
            value="isPractice"
            bind:checked={isPractice} 
        />
        Need some practice?
    </label>
    <!-- <p class="self-center text-lg text-center translate-y-56">Then hit spacebar to start the next trial</p> -->

    <div class="flex justify-center w-64 h-64 transform translate-y-48 border-8" class:border-red-500={isBoxRed} class:border-green-500={isBoxGreen} class:border-slate-500={!isBoxGreen && !isBoxRed}>
        <p class="self-center font-thin text-center text-[280px] font-courier-new" class:text-red-500={$game.isTarget} style="color: {textColor}">
            {#if displayFace}
                <img src="garik_bw.jpg" alt="Garik!!!">
            {:else}
                {$game.currentLetter}
            {/if}
        </p>
    </div>
    <p class="self-center text-center translate-y-56 text">
        {#if AB}
            Your guesses:
        {:else}
            Your guess:
        {/if}
    </p>
    <p class="self-center h-24 font-thin text-center translate-y-56 text-8xl font-courier-new">
        {#if AB}
            {#each guesses as guess}
                {guess}
            {/each}
        {:else}
            {$game.receivedLetter}
        {/if}
    </p>

    <p class="self-center text-center translate-y-56 text">
        Your reaction time:
    </p>
    <p class="self-center h-24 text-2xl font-thin text-center translate-y-56 font-courier-new">
        {reactionTime} ms
    </p>

    <div class="fixed bottom-0 left-0 w-full backdrop-blur-3xl">
        {#if user}
            <div class="flex flex-col justify-center m-2 space-y-5">
                {#if isAdmin && $adminPlay}
                    <button class="hover:text-gray-600" on:click={adminClicked}>
                        Back to admin
                    </button>
                {/if}
                <button class="m-4 hover:text-gray-600" on:click={handleSignOut}>
                    Sign out
                </button>
            </div>
        {/if}
        {#if user || (isAdmin && $adminPlay)}
            <ProgressBar current={currentTrial} total={game.totalTrials}/>
            <AccuracyBar correct={$game.correct} attempts={$game.correct + $game.incorrect}/>
        {/if}
    </div>
</div>