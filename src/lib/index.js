// place files you want to import through the `$lib` alias in this folder.
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

