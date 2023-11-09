import { writable } from 'svelte/store';
import { createABTrials } from '$lib/logic/AB';
import { createCCTrials } from '$lib/logic/CC';
import { createSiBTrials } from '$lib/logic/SiB';

export const correct = writable(0);
export const incorrect = writable(0);

export const ABTrials = writable(createABTrials());
export const CCTrials = writable(createCCTrials());
export const SiBTrials = writable(createSiBTrials());

// function begin() {
//     if (started) return;
//     if (!guessed) return;
//     if (!AB && !CC && !SiB) return;
    
//     currentTrial++;
//     inProgress = true;
//     started = true;
//     guessed = false;
//     receivedLetter = ' ';
//     guesses = [];
//     count = 0;

//     if (AB) streamAB();
//     if (CC) streamCC();
//     if (SiB) streamSiB();
// }

export const numberOfFlashes = writable(0);
export const startTime = writable(null);
export const inProgress = writable(true);
export const count = writable(0);
export const refreshRate = writable(60)
export const isOn = writable(true);
export const lastTime = writable(performance.now());
export const currentLetter = writable(' ');
export const textColor = writable();
export const isTarget = writable(false);
export const targetLetter = writable('');
export const boxColor = writable('white');
export const displayFace = writable(false);
export const currentTrial = writable(0);
