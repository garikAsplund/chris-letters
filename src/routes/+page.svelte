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
    import interact from 'interactjs';
    import { onMount }  from 'svelte';
    
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
    let currentTrial = 0;
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
    let boxDimensions = 64;
    let boxText = 280;
    let borderWidth = 8;
    const CCLetters = [];
    const SiBLetters = [];
    const NUMBER_OF_TRIALS = 96;
    
    const ABLetters = [];
    const ABTargets = [];
    const ABTextColors = [];

    let value = 50;

    while (ABLetters.length < NUMBER_OF_TRIALS) {
        const ABLettersTrial = [];
        const ABTargetsTrial = [];
        const ABTextColorsTrial = [];

        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        targetIndex = 4;
        let T1Index = targetIndex + randomRange(3);
        let T2Index = T1Index + targetOffset; 

        while(ABLettersTrial.length < 16) {
            let letterToAdd = randomRange(letters.length - 1);
            
            if (ABLettersTrial[ABLettersTrial.length - 1] === letters[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % letters.length;
            }
           
            if (ABTargetsTrial.length === T1Index || ABTargetsTrial.length === T2Index) {
                ABTargetsTrial.push(true);
                ABTextColorsTrial.push('red');
            } else {
                ABTargetsTrial.push(false);
                ABTextColorsTrial.push(distractors[randomRange(6) - 1]);
            }

            ABLettersTrial.push(letters[letterToAdd]);
        }
 
        ABLetters.push(ABLettersTrial);
        ABTargets.push(ABTargetsTrial);
        ABTextColors.push(ABTextColorsTrial);
    }

    console.log({ABLetters});
    console.log({ABTargets});
    console.log({ABTextColors});

    const SiB1Letters = [];
    const SiB1Targets = [];
    const SiB1TextColors = [];
    const SiB1Surprise = [];
    
    const SiB2Letters = [];
    const SiB2Targets = [];
    const SiB2TextColors = [];
    const SiB2Surprise = [];
    const surpriseTrials2 = [];
    
    while (surpriseTrials.length < 6) {
        let trial = randomRange(totalTrials - 2);

        if (surpriseTrials.includes(trial)
            || surpriseTrials.includes(trial - 1)
            || surpriseTrials.includes(trial + 1)) {
            continue;
        }
        
        surpriseTrials.push(trial);
    }

    while (surpriseTrials2.length < 6) {
        let trial = randomRange(totalTrials - 2);

        if (surpriseTrials2.includes(trial)
            || surpriseTrials2.includes(trial - 1)
            || surpriseTrials2.includes(trial + 1)) {
            continue;
        }
        
        surpriseTrials2.push(trial);
    }
            
    while (SiB1Letters.length < NUMBER_OF_TRIALS) {
        const SiB1LettersTrial = [];
        const SiB1TargetsTrial = [];
        const SiB1TextColorsTrial = [];
        const SiB1SurpriseTrial = [];
        
        const SiB2LettersTrial = [];
        const SiB2TargetsTrial = [];
        const SiB2TextColorsTrial = [];
        const SiB2SurpriseTrial = [];

        let targetOffset = 3;;

        // targetIndex = 4;
        // let T1Index = targetIndex + randomRange(3);
        // let T2Index = T1Index + targetOffset; 
        targetIndex = 6;
        targetIndex += randomRange(8);
        let surpriseIndex = targetIndex - targetOffset;

        if (surpriseTrials2.includes(SiB2Surprise.length)) {
            SiB2SurpriseTrial.push(true)
        } else SiB2SurpriseTrial.push(false);

        // if (surpriseTrials.includes(SiB1Surprise.length)) {
        //     SiB1SurpriseTrial.push(true)
        // } else SiB1SurpriseTrial.push(false);

        while(SiB1LettersTrial.length < 16) {
            let letterToAdd = randomRange(letters.length - 1);
            
            if (SiB1LettersTrial[SiB1LettersTrial.length - 1] === letters[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % letters.length;
            }
           
            if (SiB1TargetsTrial.length === targetIndex) {
                SiB1TargetsTrial.push(true);
                SiB1TextColorsTrial.push('red');
            } else {
                SiB1TargetsTrial.push(false);
                SiB1TextColorsTrial.push(distractors[randomRange(6) - 1]);
            }

            if (surpriseTrials.includes(SiB1Surprise.length) && SiB1SurpriseTrial.length === surpriseIndex) {
                SiB1SurpriseTrial.push(true);
            } else {
                SiB1SurpriseTrial.push(false);
            }

            SiB1LettersTrial.push(letters[letterToAdd]);
        }

        while(SiB2LettersTrial.length < 16) {
            let letterToAdd = randomRange(letters.length - 1);
            
            if (SiB2LettersTrial[SiB2LettersTrial.length - 1] === letters[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % letters.length;
            }
           
            if (SiB2TargetsTrial.length === targetIndex) {
                SiB2TargetsTrial.push(true);
                SiB2TextColorsTrial.push('red');
            } else {
                SiB2TargetsTrial.push(false);
                SiB2TextColorsTrial.push(distractors[randomRange(6) - 1]);
            }

            SiB2LettersTrial.push(letters[letterToAdd]);
        }
 
        SiB1Letters.push(SiB1LettersTrial);
        SiB1Targets.push(SiB1TargetsTrial);
        SiB1TextColors.push(SiB1TextColorsTrial);
        SiB1Surprise.push(SiB1SurpriseTrial);

        SiB2Letters.push(SiB2LettersTrial);
        SiB2Targets.push(SiB2TargetsTrial);
        SiB2TextColors.push(SiB2TextColorsTrial);
        SiB2Surprise.push(SiB2SurpriseTrial);
    }

    console.log({SiB1Letters});
    console.log({SiB1Targets});
    console.log({SiB1TextColors});
    console.log({SiB1Surprise});
    
    console.log({SiB2Letters});
    console.log({SiB2Targets});
    console.log({SiB2TextColors});
    console.log({SiB2Surprise});

    const CC1Letters = [];
    const CC1Targets = [];
    const CC1TextColors = [];
    const CC1BoxColors = [];
    
    const CC2Letters = [];
    const CC2Targets = [];
    const CC2TextColors = [];
    const CC2BoxColors = [];
    
    while (CC1Letters.length < NUMBER_OF_TRIALS) {
        const CC1LettersTrial = [];
        const CC1TargetsTrial = [];
        const CC1TextColorsTrial = [];
        const CC1BoxColorsTrial = [];
        
        const CC2LettersTrial = [];
        const CC2TargetsTrial = [];
        const CC2TextColorsTrial = [];
        const CC2BoxColorsTrial = [];

        let targetOffset = Math.random() < 0.5 ?  3 : 8;
        let distractorIndex;

        // targetIndex = 4;
        // let T1Index = targetIndex + randomRange(3);
        // let T2Index = T1Index + targetOffset; 
        targetIndex = 4;
        distractorIndex = targetIndex + randomRange(3);
        // console.log({distractorIndex});
        targetIndex = distractorIndex + targetOffset;
        // console.log({targetIndex});

        while(CC1LettersTrial.length < 16) {
            let letterToAdd = randomRange(letters.length - 1);
            
            if (CC1LettersTrial[CC1LettersTrial.length - 1] === letters[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % letters.length;
            }
           
            if (CC1TargetsTrial.length === targetIndex) {
                CC1TargetsTrial.push(true);
                CC1TextColorsTrial.push('red');
            } else {
                CC1TargetsTrial.push(false);
                CC1TextColorsTrial.push(distractors[randomRange(6) - 1]);
            }

            if (CC1TargetsTrial.length === distractorIndex) {
                CC1BoxColorsTrial.push(Math.random() < 0.5 ? 'red' : 'green');
            } else {
                CC1BoxColorsTrial.push('grey');
            }

            CC1LettersTrial.push(letters[letterToAdd]);
        }

        while(CC2LettersTrial.length < 16) {
            let letterToAdd = randomRange(letters.length - 1);
            
            if (CC2LettersTrial[CC2LettersTrial.length - 1] === letters[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % letters.length;
            }
           
            if (CC2TargetsTrial.length === targetIndex) {
                CC2TargetsTrial.push(true);
                CC2TextColorsTrial.push('red');
            } else {
                CC2TargetsTrial.push(false);
                CC2TextColorsTrial.push(distractors[randomRange(6) - 1]);
            }

            if (CC2TargetsTrial.length === distractorIndex) {
                CC2BoxColorsTrial.push(Math.random() < 0.5 ? 'red' : 'green');
            } else {
                CC2BoxColorsTrial.push('grey');
            }

            CC2LettersTrial.push(letters[letterToAdd]);
        }
 
        CC1Letters.push(CC1LettersTrial);
        CC1Targets.push(CC1TargetsTrial);
        CC1TextColors.push(CC1TextColorsTrial);
        CC1BoxColors.push(CC1BoxColorsTrial);

        CC2Letters.push(CC2LettersTrial);
        CC2Targets.push(CC2TargetsTrial);
        CC2TextColors.push(CC2TextColorsTrial);
        CC2BoxColors.push(CC2BoxColorsTrial);
    }
    
    console.log({CC1Letters});
    console.log({CC1Targets});
    console.log({CC1TextColors});
    console.log({CC1BoxColors});
    
    console.log({CC2Letters});
    console.log({CC2Targets});
    console.log({CC2TextColors});
    console.log({CC2BoxColors});

    let numberOfFlashes = 0;
    let inProgress = true;
    let boxColor = 'grey';

    function streamCC() {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            return;
        }

        if (elapsed >= (value)) {
            // Toggle the state
            isOn = !isOn;
            numberOfFlashes++;
            // console.log({numberOfFlashes});
            
            // Do something when the interval state changes (e.g., toggle a light)
            if (isOn) {
                console.log('ON ' + (performance.now() - lastTime));
                currentLetter = CC1Letters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                // console.log(currentTrial - 1);
                // console.log(numberOfFlashes / 2 - 1);
                // console.log({currentTrial});
                textColor = CC1TextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = CC1Targets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                boxColor = CC1BoxColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
            } else {
                console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
            }

            // Update the last time
            lastTime = currentTime;
        }

        // Request the next animation frame
        requestAnimationFrame(streamCC);
    }

    function streamSiB() {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            startTime = Date.now();
            displayFace = false;
            return;
        }

        if (elapsed >= (value)) {
            // Toggle the state
            isOn = !isOn;
            numberOfFlashes++;
            // console.log({numberOfFlashes});
            
            // Do something when the interval state changes (e.g., toggle a light)
            if (isOn) {
                console.log('ON ' + (performance.now() - lastTime));
                currentLetter = SiB1Letters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                // console.log(currentTrial - 1);
                // console.log(numberOfFlashes / 2 - 1);
                // console.log({currentTrial});
                textColor = SiB1TextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = SiB1Targets[currentTrial - 1][(numberOfFlashes / 2) - 1];
                displayFace = SiB1Surprise[currentTrial - 1][(numberOfFlashes / 2) - 1];   
                
                console.log({textColor});
                console.log({displayFace});

            } else {
                console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
                displayFace = SiB1Surprise[currentTrial - 1][(numberOfFlashes / 2) - 1];   
                console.log({displayFace});
            }

            // Update the last time
            lastTime = currentTime;
        }

        // Request the next animation frame
        requestAnimationFrame(streamSiB);
    }

    function toggleEvery50ms() {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        inProgress = true;

        if (numberOfFlashes > 32) {
            inProgress = false;
            return;
        }

        if (elapsed >= (value)) {
            // Toggle the state
            isOn = !isOn;
            numberOfFlashes++;
            // console.log({numberOfFlashes});
            
            // Do something when the interval state changes (e.g., toggle a light)
            if (isOn) {
                console.log('ON ' + (performance.now() - lastTime));
                currentLetter = ABLetters[currentTrial - 1][(numberOfFlashes / 2) - 1];
                // console.log(currentTrial - 1);
                // console.log(numberOfFlashes / 2 - 1);
                // console.log({currentTrial});
                textColor = ABTextColors[currentTrial - 1][(numberOfFlashes / 2) - 1];
                isTarget = ABTargets[currentTrial - 1][(numberOfFlashes / 2) - 1];
            } else {
                console.log('OFF ' + (performance.now() - lastTime));
                currentLetter = ' ';
            }

            // Update the last time
            lastTime = currentTime;
        }

        // Request the next animation frame
        requestAnimationFrame(toggleEvery50ms);
    }

    let lastTime = performance.now();
    let isOn = true;

    onMount(() => {
        const storedBoxText = localStorage.getItem('boxText');
        const storedBorderWidth = localStorage.getItem('borderWidth');
            if (storedBoxText && storedBorderWidth) {
                boxText = parseInt(storedBoxText, 10);
                borderWidth = parseInt(storedBorderWidth, 10);
                console.log({boxText}, {borderWidth});
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


    // while (surpriseTrials.length < 6) {
    //     let trial = randomRange(totalTrials - 2);

    //     if (surpriseTrials.includes(trial)
    //         || surpriseTrials.includes(trial - 1)
    //         || surpriseTrials.includes(trial + 1)) {
    //         continue;
    //     }
        
    //     surpriseTrials.push(trial);
    // }

    console.log({surpriseTrials});

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
        }

        started = true;
        guessed = false;
        receivedLetter = ' ';
        guesses = [];

        if (AB) toggleEvery50ms();
        if (CC) streamCC();
        if (SiB) streamSiB();

        // let count = 0;
        // let boxColor;
        // let T1Index;
        // let T2Index;
        // let targetOffset = Math.random() < 0.5 ?  3 : 8;

        // targetLetter = targets[randomRange(targets.length) - 1];
        // targetLetters = [];
        
        // if (AB) {
        //     trialType = "AB";
        //     targetLetters.push(targetLetter);
        //     targetIndex = 4;
        //     T1Index = targetIndex + randomRange(3);
        //     T2Index = T1Index + targetOffset; 
        // }

        // if (CC) {
        //     trialType = "CC";
        //     boxIndex = 4;
        //     boxIndex += randomRange(3);
        //     boxIndex *= 2;
        //     targetOffset *= 2;
        //     boxColor = Math.random() < 0.5 ?  "red" : "green";
        // }

        // if (SiB) {
        //     trialType = "SiB";
        //     targetIndex = 6;
        //     targetIndex += randomRange(8);
        // }

        // const flash = setInterval(() => {                
        //     flashes(count++, boxColor, targetOffset, T1Index, T2Index);
            
        //     if (count >= 32) clearInterval(flash);
        // }, isPractice ? 50 * 2 : 50);

        // setTimeout(() => {
        //     started = false;
        // }, isPractice ? 50 * 32 * 2 : 50 * 32);
    }

    // function flashes(count, boxColor, targetOffset, T1Index, T2Index) {
    //     if (AB) {
    //         if (count === T1Index * 2 || count === T2Index * 2) {
    //             everyTarget.push(targetLetter);
    //             currentLetter = targetLetter;
    //             isTarget = true;
    //             textColor = "red";
    //             startTime = Date.now();
    //             targetLetter = targets[randomRange(targets.length) - 1];
    //             targetLetters.push(targetLetter);
    //         } else if (showLetter) {
    //             isTarget = false;
    //             textColor = distractors[randomRange(6)];
    //             currentLetter = letters[randomRange(letters.length) - 1];
    //         } else {
    //             currentLetter = ' '; 
    //         }
    //     }

    //     if (CC) {
    //         if (count === boxIndex + targetOffset) {
    //             everyTarget.push(targetLetter);
    //             currentLetter = targetLetter;
    //             isTarget = true;
    //             textColor = "red";
    //             startTime = Date.now();
    //         } else if (showLetter) {
    //             isTarget = false;
    //             textColor = distractors[randomRange(6)];
    //             currentLetter = letters[randomRange(letters.length) - 1];
    //         } else {
    //             currentLetter = ' '; 
    //         }
        
    //         if (boxColor === "green") {
    //             if (count === boxIndex || count === boxIndex + 1) {
    //                 isBoxGreen = true;
    //             } else {
    //                 isBoxGreen = false;
    //             }
    //         }
    //         if (boxColor === "red") {
    //             if (count === boxIndex || count === boxIndex + 1) {
    //                 isBoxRed = true;
    //             } else {
    //                 isBoxRed = false;
    //             } 
    //         }
    //     }

    //     if (SiB) {
    //         if (surpriseTrials.includes(currentTrial) && (count === targetIndex * 2 - 6 || count === targetIndex * 2 - 5)) {
    //             displayFace = true;
    //         } else if (count === targetIndex * 2) {
    //             everyTarget.push(targetLetter);
    //             displayFace = false;
    //             currentLetter = targetLetter;
    //             isTarget = true;
    //             textColor = "red";
    //             startTime = Date.now();
    //         } else if (showLetter) {
    //             isTarget = false;
    //             textColor = distractors[randomRange(6)];
    //             currentLetter = letters[randomRange(letters.length) - 1];
    //         } else {
    //             currentLetter = ' '; 
    //         }
    //     }
        
    //     showLetter = !showLetter;
    // }

    function handleKeydown(event) {
        if (AB && !inProgress) {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase()) && guesses.length < 2) {
                    startTime = Date.now();
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
                        numberOfFlashes = 1;
                        started = false;
                        setTimeout(begin, 600);
                    }
                }
            }
        } else if ((SiB || CC) && !inProgress) {
            if (event.key && event.key.length === 1) {
                if (letters.includes(event.key.toUpperCase())) {
                    if (startTime) {
                        reactionTime = Date.now() - startTime;
                        everyReactionTime.push(reactionTime);
                        startTime = null; 
                        started = false;
                        numberOfFlashes = 1;
                        guessed = true;
                        receivedLetter = event.key.toUpperCase();
                        receivedLetter === targetLetter ? $correct++ : $incorrect++;
                        receivedLetter === targetLetter ? everyAccuracy.push(1) : everyAccuracy.push(0);
                        everyGuess.push(receivedLetter);
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

    // function adminClicked() {
    //     $adminPlay = false;
    // }

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

            console.log({boxText}, {borderWidth});
        });
</script>
    
<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<html lang="en" class="h-screen bg-white bg-no-repeat">
<body>  
    <!-- {#if isAdmin && !$adminPlay}
        <Admin />
    {/if} -->
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
            <!-- <h1 class="flex justify-center text-4xl font-bold text-center transform translate-y-10">
                🪇 Welcome to our experiment 🧑‍🔬
            </h1> -->
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
                <!-- {#if !AB && !CC && !SiB}
                    <p class="p-2 text-4xl translate-y-32">
                        Please select an option from above 👆
                    </p>
                {:else if !clicked}
                    <button on:click={onClick} class="p-2 text-4xl transform translate-y-32 bg-gray-100 border border-black rounded-sm hover:bg-gray-200">
                        {buttonText}
                    </button>
                {:else}
                    <p class="p-2 text-4xl text-transparent translate-y-32">Shhh, this is secret!!!</p>
                {/if} -->
                <!-- <h3 class="w-2/5 text-xl text-center transform translate-y-40">
                    Whenever you see a red letter, press that key on your keyboard
                </h3> -->

                <label class="flex flex-col m-4 text-xl text-center translate-y-32">
                    <input type="range" bind:value min="40" max="400"/>
                    <br>
                    {value} ms
                </label>
                <!-- <p class="self-center text-lg text-center translate-y-56">Then hit spacebar to start the next trial</p> -->
         
                
                <!-- <p class="self-center text-center translate-y-56 text">
                    {#if AB}
                        Your guesses:
                    {:else}
                        Your guess:
                    {/if}
                </p> -->
                
                <!-- <p class="self-center h-24 font-thin text-center translate-y-56 text-8xl font-courier-new">
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
                </p> -->

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
                        <ProgressBar current={currentTrial} total={totalTrials}/>
                        <!-- <AccuracyBar correct={$correct} attempts={$correct + $incorrect}/> -->
                </div>
            </div>
        {:else if currentTrial === totalTrials}
            <GameOver />
        {/if}
    {/if}
</body>
</html>