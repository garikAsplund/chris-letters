import { writable } from 'svelte/store';
import { createABTrials } from '$lib/logic/AB';
import { createCCTrials } from '$lib/logic/CC';
import { createSiBTrials } from '$lib/logic/SiB';

export const isAdmin = writable(false);
export const things = writable({});
export const isComplete = writable(false);

export const correct = writable(0);
export const incorrect = writable(0);

export const ABTrials = writable(createABTrials());
export const CCTrials = writable(createCCTrials());
export const SiBTrials = writable(createSiBTrials());

export const numberOfFlashes = writable(0);
export const startTime = writable(Date.now());
export const inProgress = writable(true);
export const count = writable(0);
export const refreshRate = writable(60);
export const isOn = writable(true);
export const lastTime = writable(performance.now());
export const currentLetter = writable(' ');
export const textColor = writable();
export const isTarget = writable(false);
export const targetLetter = writable('');
export const boxColor = writable('white');
export const displayFace = writable(false);
export const currentTrial = writable(0);
