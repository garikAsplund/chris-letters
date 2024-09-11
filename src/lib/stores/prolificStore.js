import { writable } from 'svelte/store';

export const prolificStore = writable({
  PROLIFIC_PID: null,
  STUDY_ID: null,
  SESSION_ID: null
});