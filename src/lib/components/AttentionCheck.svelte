<script lang="ts">
  import { onMount } from "svelte";
  import { db, auth } from "$lib/database/firebase";
  import { ref, push, set } from "firebase/database";
  import { blockNumber, sessionNumber } from "$lib/stores/GameStore";

  export let onComplete: (r: any) => void;

  const letters = "ABCDEFGHJKMNPQRSTUVXYZ".split("");
  const digits = "23456789".split("");

  let top = "", bottom = "", left = "", right = "", center = "";
  let start = 0;
  let answered = false;
  let finished = false;
  let message = "";
  let timeLeft = $blockNumber === 1 ? 20 : 10;
  let ticker: any;
  let resumeTimer: any;
  let resumeCount = 3;

  function pick<T>(a: T[]): T {
    return a[Math.floor(Math.random() * a.length)];
  }

  function newTrial() {
    top = pick(letters);
    bottom = pick(letters);
    left = pick(letters);
    right = pick(letters);
    center = pick(digits);
    start = performance.now();
  }

  function startResumeCountdown(result) {
    finished = true;            // hides the cross
    message = `Resuming experiment in ${resumeCount}...`;
    resumeTimer = setInterval(() => {
      resumeCount--;
      if (resumeCount > 0) {
        message = `Resuming experiment in ${resumeCount}...`;
      } else {
        clearInterval(resumeTimer);
        onComplete?.(result);
      }
    }, 1000);
  }

  function finish(result) {
    if (answered) return;
    answered = true;
    clearInterval(ticker);
    window.removeEventListener("keydown", keyHandler);

    const uid = auth.currentUser?.uid;
    if (uid) {
      const entry = push(ref(db, `users/${uid}/attentionChecks`));
      set(entry, result);
    }

    startResumeCountdown(result);
  }

  function keyHandler(e: KeyboardEvent) {
    if (answered) return;
    const rt = performance.now() - start;
    const result = {
      pressed: e.key,
      correct: e.key === center,
      rt,
      letters: { top, bottom, left, right },
      center,
      timedOut: false,
      time: Date.now(),
      session: $sessionNumber,
    };
    finish(result);
  }

  onMount(() => {
    newTrial();
    window.addEventListener("keydown", keyHandler);
    ticker = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        const rt = performance.now() - start;
        finish({
          pressed: null,
          correct: false,
          rt,
          letters: { top, bottom, left, right },
          center,
          timedOut: true,
          time: Date.now(),
          session: $sessionNumber,
        });
      }
    }, 1000);
  });
</script>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 80vw;
    color: white;
    text-align: center;
  }
  .timer {
    border: 2px solid white;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 2rem;
  }
  .cross {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto auto;
    justify-items: center;
    align-items: center;
    margin-top: 2rem;
    font-size: 3rem;
    color: gold;
    gap: 1.6rem;
  }
  .top { grid-column: 2; grid-row: 1; }
  .left { grid-column: 1; grid-row: 2; }
  .center { grid-column: 2; grid-row: 2; }
  .right { grid-column: 3; grid-row: 2; }
  .bottom { grid-column: 2; grid-row: 3; }
  .prompt {
    font-size: 1.6rem;
    max-width: 60ch;
  }
  .resume {
    font-size: 2rem;
    margin-top: 3rem;
    color: rgb(216, 216, 216);
  }
</style>

<div class="wrapper">
  {#if !finished}
    <div class="timer">{timeLeft}</div>
    <div class="prompt">
      <p>This is an attentional check.</p><br>
      <p>
        Press the button on the keyboard corresponding to the
        <u>numerical digit</u> that is presented among the stimuli below.
      </p><br>
    </div>

    <div class="cross">
      <div class="top">{top}</div>
      <div class="left">{left}</div>
      <div class="center">{center}</div>
      <div class="right">{right}</div>
      <div class="bottom">{bottom}</div>
    </div>
  {:else}
    <div class="resume">{message}</div>
  {/if}
</div>