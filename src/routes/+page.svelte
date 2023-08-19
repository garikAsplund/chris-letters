<script>
	import AccuracyBar from '$lib/components/AccuracyBar.svelte';
    import ProgressBar from '$lib/components/ProgressBar.svelte';
    import Admin from '$lib/components/Admin.svelte';
    import { emojisplosions } from 'emojisplosion';
    import { getDatabase, ref, set, child, get } from "firebase/database";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
    import app from "$lib/firebase";
    import ShortUniqueId from 'short-unique-id';
    import { adminPlay } from '$lib/stores/AdminStore';
    import { correct, incorrect } from '$lib/stores/GameStore';
	import GameOver from '$lib/components/GameOver.svelte';
    
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
        isAdmin = false; // Set the initial value

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
        const trialId = uid.seq();

        set(ref(db, `blocks/${trialId}`), {
            trialType: trialType,
            targets: everyTarget,
            guesses: everyGuess,
            accuracy: everyAccuracy,
            reactionTime: everyReactionTime,
        });
    }
    
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
    let boxIndex;
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
    let targetLetters = [];
    let buttonText = "Start";
    let clicked = false;
    let everyTarget = [];
    let everyGuess = [];
    let everyAccuracy = [];
    let everyReactionTime = [];
    let trialType;
    let isPractice = false;

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

    function onClick() {
        buttonText = "Trial already in progress";
        clicked = true;
        setTimeout(begin, 400);
    }

    function begin() {
        if (started) return;
        if (!guessed) return;
        if (!AB && !CC && !SiB) return;
        if (++currentTrial === totalTrials) {
            gameOver();  
            writeTrialData(trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime);
            // return;
        }

        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];

        let count = 0;
        let boxColor;
        let T1Index;
        let T2Index;
        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        targetLetter = targets[randomRange(targets.length) - 1];
        targetLetters = [];
        
        if (AB) {
            trialType = "AB";
            targetLetters.push(targetLetter);
            targetIndex = 4;
            T1Index = targetIndex + randomRange(3);
            T2Index = T1Index + targetOffset; 
        }

        if (CC) {
            trialType = "CC";
            boxIndex = 4;
            boxIndex += randomRange(3);
            boxIndex *= 2;
            targetOffset *= 2;
            boxColor = Math.random() < 0.5 ?  "red" : "green";
        }

        if (SiB) {
            trialType = "SiB";
            targetIndex = 6;
            targetIndex += randomRange(8);
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
                everyTarget.push(targetLetter);
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
                targetLetter = targets[randomRange(targets.length) - 1];
                targetLetters.push(targetLetter);
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[randomRange(letters.length) - 1];
            } else {
                currentLetter = ' '; 
            }
        }

        if (CC) {
            if (count === boxIndex + targetOffset) {
                everyTarget.push(targetLetter);
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[randomRange(letters.length) - 1];
            } else {
                currentLetter = ' '; 
            }
        
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

        if (SiB) {
            if (surpriseTrials.includes(currentTrial) && (count === targetIndex * 2 - 6 || count === targetIndex * 2 - 5)) {
                displayFace = true;
            } else if (count === targetIndex * 2) {
                everyTarget.push(targetLetter);
                displayFace = false;
                currentLetter = targetLetter;
                isTarget = true;
                textColor = "red";
                startTime = Date.now();
            } else if (showLetter) {
                isTarget = false;
                textColor = distractors[randomRange(6)];
                currentLetter = letters[randomRange(letters.length) - 1];
            } else {
                currentLetter = ' '; 
            }
        }
        
        showLetter = !showLetter;
    }

    function handleKeydown(event) {
        if (AB) {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        guesses = [...guesses, event.key.toUpperCase()];
                    }
                    if (guesses.length === 2) {
                        guessed = true;
                        startTime = null; 
                        everyReactionTime.push(reactionTime);
                        everyGuess.push(...guesses);
                        
                        if (targetLetters.includes(guesses[0]) && targetLetters.includes(guesses[1])) {
                            $correct += 2;
                            everyAccuracy.push(2);
                        } else if (targetLetters.includes(guesses[0]) || targetLetters.includes(guesses[1])) {
                            $correct++;
                            $incorrect++;
                            everyAccuracy.push(1);
                        } else {
                            $incorrect += 2;
                            everyAccuracy.push(0);
                        }
                    }
                }
            }
        } else {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        everyReactionTime.push(reactionTime);
                        startTime = null; 
                        guessed = true;
                        receivedLetter = event.key.toUpperCase();
                        receivedLetter === targetLetter ? $correct++ : $incorrect++;
                        receivedLetter === targetLetter ? everyAccuracy.push(1) : everyAccuracy.push(0);
                        everyGuess.push(receivedLetter);
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

    function adminClicked() {
        $adminPlay = false;
    }
</script>
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-no-repeat bg-gradient-to-b from-fuchsia-300 to-white">
<body>  
    {#if isAdmin && !$adminPlay}
        <Admin />
    {/if}
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
        {#if (currentTrial < 96 && !isAdmin) || (currentTrial < 96 && $adminPlay)}
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
                    <p class="self-center font-thin text-center text-[280px] font-courier-new" class:text-red-500={isTarget} style="color: {textColor}">
                        {#if displayFace}
                            <img src="garik_bw.jpg" alt="Garik!!!">
                        {:else}
                            {currentLetter}
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
                        {receivedLetter}
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
                        <ProgressBar current={currentTrial} total={totalTrials}/>
                        <AccuracyBar correct={$correct} attempts={$correct + $incorrect}/>
                    {/if}
                </div>
            </div>
        {:else if currentTrial === totalTrials}
            <GameOver />
        {/if}
    {/if}
</body>
</html>