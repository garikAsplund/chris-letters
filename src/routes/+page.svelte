<script>
	import AccuracyBar from '$lib/components/AccuracyBar.svelte';
    import ProgressBar from '$lib/components/ProgressBar.svelte';
    import { emojisplosion } from 'emojisplosion';

    // Import the functions you need from the SDKs you need
    // import { initializeApp } from "firebase/app";
    import { getDatabase, ref, set } from "firebase/database";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
    import app from "$lib/firebase";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  
    // const firebaseConfig = {
    //     apiKey: "AIzaSyDiauRrelcJu1GuYZ5Fqz6cz2y0LLv3C3g",
    //     authDomain: "chris-letters.firebaseapp.com",
    //     databaseURL: "https://chris-letters-default-rtdb.asia-southeast1.firebasedatabase.app",
    //     projectId: "chris-letters",
    //     storageBucket: "chris-letters.appspot.com",
    //     messagingSenderId: "867592075139",
    //     appId: "1:867592075139:web:bc8cfdcd4d74bd0a2668b6",
    //     measurementId: "G-3SEHN30EF8"
    // };

    // Initialize Firebase
    // const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);

    const googleProvider = new GoogleAuthProvider();

    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            if (user && user.displayName) {
                writeUserData(user.uid, user.displayName);
            }  
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
        }
    }

    let user = null;
    
    onAuthStateChanged(auth, (currentUser) => {
        user = currentUser;
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
            displayName: displayName
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
    let currentTrial = 90;
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
    let correct = 0;
    let incorrect = 0;
    let targetLetters = [];
    let buttonText = "Start";
    let clicked = false;

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

        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];

        let count = 0;
        let boxColor;
        let T1Index;
        let T2Index;
        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        currentTrial++;
        targetLetter = targets[randomRange(targets.length) - 1];
        targetLetters = [];
        
        if (AB) {
            targetLetters.push(targetLetter);
            targetIndex = 4;
            T1Index = targetIndex + randomRange(3);
            T2Index = T1Index + targetOffset; 
        }

        if (CC) {
            boxIndex = 4;
            boxIndex += randomRange(3);
            boxIndex *= 2;
            targetOffset *= 2;
            boxColor = Math.random() < 0.5 ?  "red" : "green";
        }

        if (SiB) {
            targetIndex = 6;
            targetIndex += randomRange(8);
        }

        const flash = setInterval(() => {                
            flashes(count++, boxColor, targetOffset, T1Index, T2Index);
            
            if (count >= 32) clearInterval(flash);
        }, 50);

        setTimeout(() => {
            started = false;
        }, 50 * 32);
    }

    function flashes(count, boxColor, targetOffset, T1Index, T2Index) {
        if (AB) {
            if (count === T1Index * 2 || count === T2Index * 2) {
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
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        guesses = [...guesses, event.key.toUpperCase()];
                    }
                    if (guesses.length === 2) {
                        guessed = true;
                        startTime = null; 
                        
                        if (targetLetters.includes(guesses[0]) && targetLetters.includes(guesses[1])) {
                            correct += 2;
                        } else if (targetLetters.includes(guesses[0]) || targetLetters.includes(guesses[1])) {
                            correct++;
                            incorrect++;
                        } else {
                            incorrect += 2;
                        }
                    }
                }
            }
        } else {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        startTime = null; 
                        guessed = true;
                        receivedLetter = event.key.toUpperCase();
                        receivedLetter === targetLetter ? correct++ : incorrect++;
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

    if (currentTrial > 96) {
        
    }
</script>
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-no-repeat bg-gradient-to-b from-fuchsia-300 to-white">
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
                    <p class="p-2 text-4xl translate-y-32">Please select an option from above 👆</p>
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

                <p class="self-center text-center translate-y-56 text">Your reaction time:</p>
                <p class="self-center h-24 text-2xl font-thin text-center translate-y-56 font-courier-new">{reactionTime} ms</p>

                <div class="fixed bottom-0 left-0 w-full">
                    {#if user}
                    <div class="flex justify-center m-4">
                        <button on:click={handleSignOut}>
                            Sign out
                        </button>
                    </div>
                    {/if}
                    <ProgressBar current={currentTrial} total={totalTrials}/>
                    <AccuracyBar correct={correct} attempts={correct + incorrect}/>
                </div>
            </div>
        {:else}
            <h1 class="flex justify-center text-4xl font-bold transform translate-y-20 ">
                😍 Thanks for playing!!! 😎
            </h1>
            
            {#if (correct / (correct + incorrect)) > 0.8}
                <h1 class="flex justify-center text-2xl font-bold transform translate-y-32">
                    🫨 Wow, way to go!
                </h1>
            {:else if (correct / (correct + incorrect)) > 0.65}
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
        {/if}
    {/if}
</body>
</html>
