<script>
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
    [0,0,255],      // blue
    [200,200,0],    // yellow
    [200,0,200],    // magenta
    [0,200,200],    // cyan
    [200,200,200],  // light grey
    [50,50,50],     // dark grey
];

// 16 items per array
// place target letter at _ index

// start 400ms blank

// 50ms per frame
// alternating letter, blank frame

// T1/T2 lag either 300ms or 800ms

// reverse responses are correct

let display = "A";
let i = 0;

function begin() {
    display = letters[i++ % letters.length];
}

</script>

<h1 class="transform translate-y-20 flex justify-center text-4xl font-bold underline">
    Welcome to our experiment :)
</h1>

<div class="flex flex-col items-center">
    <h3 class="text-center transform translate-y-40 text-xl w-2/5">
        Whenever you see a red letter, press that key on your keyboard
    </h3>

    <button on:click={begin} class="bg-gray-100 hover:bg-gray-200 p-2 border rounded-sm border-black transform translate-y-60 text-4xl">
        Start
    </button>

    <div class="flex justify-center w-32 h-32 border-4 transform translate-y-80">
        <p class="self-center text-6xl font-mono text-center font-thin">{display}</p>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.fuchsia.200);
    }
</style>    