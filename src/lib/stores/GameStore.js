import { createABTrials } from "$lib/logic/AB";
import { createCCTrials } from "$lib/logic/CC";
import { createSiBTrials } from "$lib/logic/SiB";
import { createVABTrials } from "$lib/logic/VAB";
import { writable } from "svelte/store";

export const isAdmin = writable(false);
export const things = writable({});
export const isComplete = writable(false);
export const sessionNumber = writable(1);

export const correct = writable(0);
export const incorrect = writable(0);

export const ABTrials = writable(createABTrials());
export const CCTrials = writable(createCCTrials());
export const CCTrials2 = writable(createCCTrials());
export const SiBTrials = writable(createSiBTrials());
// export const SiBTrials2 = writable(createSiBTrials(false, true));

export const VABTrials1 = writable(createVABTrials());
export const VABTrials2 = writable(createVABTrials());
export const VABTrials3 = writable(createVABTrials());
export const VABTrials4 = writable(createVABTrials());
export const VABTrials5 = writable(createVABTrials());
export const VABTrials6 = writable(createVABTrials());

export const ABPractice = writable(createABTrials());
export const CCPractice = writable(createCCTrials(true));
export const SiBPractice = writable(createSiBTrials(true));
export const VABPractice1 = writable(createVABTrials(true, 1));
export const VABPractice2 = writable(createVABTrials(true, 2));
export const VABPractice3 = writable(createVABTrials(true, 3));

export const numberOfFlashes = writable(0);
export const startTime = writable(Date.now());
export const inProgress = writable(false);
export const count = writable(0);
export const refreshRate = writable(60);
export const isOn = writable(true);
export const lastTime = writable(performance.now());
export const currentLetter = writable(" ");
export const textColor = writable();
export const isTarget = writable(false);
export const targetLetter = writable("");
export const boxColor = writable("white");
export const displayFace = writable(false);
export const currentTrial = writable(0);
export const isPractice = writable(true);
export const isPracticeCount = writable(0);
export const targetColor = writable("");

export const started = writable(false);
export const guessed = writable(true);

export const guesses = writable([]);
export const everyReactionTime = writable([]);
export const everyGuess = writable([]);
export const everyTarget = writable([]);
export const everyAccuracy = writable([]);
export const everyStreamDuration = writable([]);

export const probe = writable("");
export const everyProbeGuess = writable([]);
export const everyProbeAccuracy = writable([]);

export const gender= writable("");
export const handedness = writable("");
export const age = writable("");
