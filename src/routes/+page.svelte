<script>
    import ProgressBar from '$lib/components/ProgressBar.svelte';
    import Admin from '$lib/components/Admin.svelte';
    import { emojisplosions } from 'emojisplosion';
    import { getDatabase, ref, set, child, get } from "firebase/database";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
    import app from "$lib/firebase";
    import ShortUniqueId from 'short-unique-id';
	import GameOver from '$lib/components/GameOver.svelte';
    import interact from 'interactjs';
    import { afterUpdate, onMount }  from 'svelte';
    import { randomRange, DISTRACTORS, LETTERS, NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
    import { createABTrials } from '$lib/logic/AB';
    import { createCCTrials } from '$lib/logic/CC';
    import { createSiBTrials } from '$lib/logic/SiB';
    import { getScreenRefreshRate } from '$lib/logic/refreshRate';

    const db = getDatabase(app);
    const dbRef = ref(getDatabase());
    const auth = getAuth(app);
    let isAdmin;

    const googleProvider = new GoogleAuthProvider();

    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            const userAlreadyExists = await get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("No data available, creating user");
                    if (user && user.displayName) {
                        writeUserData(user.uid, user.displayName);
                    } 
                }
                }).catch((error) => {
                console.error(error);
            });
            
            get(child(dbRef, `users/${user.uid}/admin`)).then((snapshot) => {
                if (snapshot.exists()) {
                    isAdmin = snapshot.val();
                } else {
                    console.log("No data available");
                }
                }).catch((error) => {
                console.error(error);
            }); 
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
        }
    }

    let user = null;
    
    onAuthStateChanged(auth, (currentUser) => {
        user = currentUser;
        isAdmin = false;

        if (currentUser) {
            get(child(dbRef, `users/${currentUser.uid}/admin`)).then((snapshot) => {
                if (snapshot.exists()) {
                    isAdmin = snapshot.val();
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    });

    async function handleSignOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error.message);
        }
    }

    function writeUserData(userId, displayName) {
        set(ref(db, `users/${userId}`), {
            displayName: displayName,
            admin: false,
        });
    }

    function writeTrialData(trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime) {
        const uid = new ShortUniqueId();
        const trialId = uid();

        set(ref(db, `blocks/${trialId}`), {
            trialType: trialType,
            targets: everyTarget,
            guesses: everyGuess,
            accuracy: everyAccuracy,
            reactionTime: everyReactionTime,
        });
    }

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

    // start out 8 trials of practice before EACH task
    // then AB 96
    // then CC 2 x 96
    // then SiB 2 x 96--first 60 and final 60 for SiB

    const { ABLetters, ABTargets, ABTextColors } = createABTrials();
    const { CCLetters, CCTargets, CCTextColors, CCBoxColors } = createCCTrials();
    const { CCLetters: CC2Letters, CCTargets: CC2Targets, CCTextColors: CC2TextColors, CCBoxColors: CC2BoxColors } = createCCTrials();
    const { SiBLetters, SiBTargets, SiBTextColors, SiBSurprise } = createSiBTrials();
    const { SiBLetters: SiB2Letters, SiBTargets: SiB2Targets, SiBTextColors: SiB2TextColors, SiBSurprise: SiB2Surprise} = createSiBTrials();
    
    console.log({ABLetters});
    console.log({ABTargets});
    console.log({ABTextColors});

    console.log({CCLetters});
    console.log({CCTargets});
    console.log({CCTextColors});
    console.log({CCBoxColors});
    
    console.log({CC2Letters});
    console.log({CC2Targets});
    console.log({CC2TextColors});
    console.log({CC2BoxColors});

    console.log({SiBLetters});
    console.log({SiBTargets});
    console.log({SiBTextColors});
    console.log({SiBSurprise});
    
    console.log({SiB2Letters});
    console.log({SiB2Targets});
    console.log({SiB2TextColors});
    console.log({SiB2Surprise});

    let count = 0;
    
    function streamAB() {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        // inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            return;
        }
        
        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
        // if (elapsed >= (value)) {
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
        const elapsed = currentTime - lastTime;
        // inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            return;
        }
 
        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
        // if (elapsed >= (value)) {
            isOn = !isOn;
            numberOfFlashes++;
            
            if (isOn) {
                // console.log('ON ' + (performance.now() - lastTime));
                
                currentLetter = CC1Letters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                textColor = CC1TextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = CC1Targets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                boxColor = CC1BoxColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                
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
        const elapsed = currentTime - lastTime;
        // inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            displayFace = false;
            return;
        }

        if (++count % (Math.floor(value / Math.floor(1000 / refreshRate))) === 0) {
        // if (elapsed >= (value)) {
            isOn = !isOn;
            numberOfFlashes++;
            
            if (isOn) {
                // console.log('ON ' + (performance.now() - lastTime));
                
                currentLetter = SiB1Letters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                textColor = SiB1TextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = SiB1Targets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                displayFace = SiB1Surprise[currentTrial - 1][(numberOfFlashes / 2) - 1];
                 
                if (isTarget) {
                    targetLetter += currentLetter;
                }  
            } else {
                // console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
                displayFace = SiB1Surprise[currentTrial - 1][((numberOfFlashes - 1) / 2) - 1];   
            }

            lastTime = currentTime;
        }

        requestAnimationFrame(streamSiB);
    }

    let lastTime = performance.now();
    let isOn = true;

    onMount(() => {
        const storedBoxText = localStorage.getItem('boxText');
        const storedBorderWidth = localStorage.getItem('borderWidth');
            if (storedBoxText && storedBorderWidth) {
                boxText = parseInt(storedBoxText, 10);
                borderWidth = parseInt(storedBorderWidth, 10);
                // console.log({boxText}, {borderWidth});
            }
    });

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

    function onClick() {
        buttonText = "Trial already in progress";
        clicked = true;
        setTimeout(begin, 400);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;
        if (!AB && !CC && !SiB) return;
        if (++currentTrial === NUMBER_OF_TRIALS) {
            gameOver();  
            writeTrialData(trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime);
        }

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

            // console.log({boxText}, {borderWidth});
        });
</script>
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-gray-400 bg-no-repeat">
    <head>
        <title>
            Streaming letters
        </title>
    </head>
<body>  
    {#if !user}
        <h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-10">
            🪇 Welcome to our experiment 🧑‍🔬
        </h1>
        
        <div class="flex flex-col items-center justify-center h-screen">
            <button class="px-4 py-2 font-semibold text-gray-600 -translate-y-24 bg-transparent border border-gray-500 rounded hover:bg-gray-500 hover:text-white hover:border-transparent" on:click={signInWithGoogle}>
                Sign in with Google
            </button> 
        </div>
    {:else}
        {#if currentTrial < 96}
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

                <div class="fixed bottom-0 left-0 w-full backdrop-blur-3xl">
                    {#if user || isAdmin}
                        <div class="flex flex-col justify-center m-2 space-y-2">
                            {#if isAdmin}
                                <Admin />
                            {/if}
                            <button class="hover:text-gray-600" on:click={handleSignOut}>
                                Sign out
                            </button>
                        </div>
                    {/if}
                        <ProgressBar current={currentTrial} total={NUMBER_OF_TRIALS}/>
                </div>
            </div>
        {:else if currentTrial === NUMBER_OF_TRIALS}
            <GameOver />
        {/if}
    {/if}
</body>
</html>