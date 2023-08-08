<script>
import ProgressBar from '$lib/components/ProgressBar.svelte';

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

// 16 items per array
// place target letter at _ index

// start 400ms blank

// 50ms per frame
// alternating letter, blank frame

// T1/T2 lag either 300ms or 800ms

// reverse responses are correct

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
let currentTrial = 0;
const totalTrials = 96;
let started = false;
let guessed = true;
let reactionTime = '0';

function randomRange(max) {
  return Math.ceil(Math.random() * max);
}

function begin() {
    if (started) return;
    if (!guessed) return;

    started = true;
    guessed = false;
    receivedLetter = ' ';

    let count = 0;
    currentTrial++;
    let boxColor = Math.random() < 0.5 ?  "red" : "green";
    let boxDistance = Math.random() < 0.5 ?  6 : 16;
    targetLetter = targets[plays++ % targets.length];

    const flash = setInterval(() => {
        flashes(count++, boxColor, boxDistance);
        if (count >= 32) clearInterval(flash);
    }, 50);

    setTimeout(() => {
        started = false;
    }, 50 * 32);
}

function flashes(count, boxColor, boxDistance) {
    if (count === targetIndex * 2) {
        currentLetter = targetLetter;
        isTarget = true;
    } else if (showLetter) {
        isTarget = false;
        currentLetter = letters[Math.floor(Math.random() * letters.length)];
    } else {
        currentLetter = ' '; 
    }

    textColor = distractors[randomRange(6)];

    // either 3 or 8 items before target for 100ms
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
    
    showLetter = !showLetter;
}

function handleKeydown(event) {
    guessed = true;
    if (event.key && event.key.length === 1) {
        if (letters.includes(event.key.toUpperCase())) {
            receivedLetter = event.key.toUpperCase();
        }
    }
}

function nextTrial(event) {
    if (event.key == " " && event.key.length === 1) {
        begin();
    }
}
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={nextTrial}/>

<h1 class="transform translate-y-20 flex justify-center text-4xl font-bold ">
    🪇 Welcome to our experiment 🧑‍🔬
</h1>

<div class="flex flex-col items-center">
    <h3 class="text-center transform translate-y-40 text-xl w-2/5">
        Whenever you see a red letter, press that key on your keyboard
    </h3>

    <button on:click={begin} class="bg-gray-100 hover:bg-gray-200 p-2 border rounded-sm border-black transform translate-y-52 text-4xl">
        Start
    </button>
    <p class="self-center text-lg text-center translate-y-60">Then hit spacebar to start the next trial</p>


    <div class="flex justify-center w-32 h-32 border-4 transform translate-y-80" class:border-red-500={isBoxRed} class:border-green-500={isBoxGreen}>
        <p class="self-center text-8xl font-courier-new text-center font-thin" class:text-red-500={isTarget} style="color: {textColor}">{currentLetter}</p>
    </div>
    <p class="self-center text text-center translate-y-96">Your guess:</p>
    <p class="self-center h-24 text-8xl font-courier-new text-center font-thin translate-y-96">{receivedLetter}</p>

    <p class="self-center text text-center translate-y-96">Your reaction time:</p>
    <p class="self-center text-2xl font-courier-new text-center font-thin translate-y-96">{reactionTime} ms</p>
    

    <div class="fixed bottom-0 left-0 w-full">
        <ProgressBar current={currentTrial} total={totalTrials}/>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.fuchsia.200);
    }
</style>    