<script>
    import { correct, incorrect } from "$lib/stores/GameStore";
    import { emojisplosions } from 'emojisplosion';
    import ShortUniqueId from 'short-unique-id';
    import { ref, set } from "firebase/database";
    import { db } from "$lib/firebase";
    
    function gameOver() {
        const { cancel } = emojisplosions({
                emojis: ["🍕", "🍷", "🙌", "🎆", "🍻", "🎊","🥮", "🏆", "🍾", "🪇", "🥇", "🎇", "🎉", "🪅", "🎁", "🪩", "✨", "🌠", "💯", "🔥", ],
                interval: 100,
                physics: {
                    fontSize: {
                        max: 54,
                        min: 24,
                    },
                },
            });
            setTimeout(cancel, 2000); 
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

    writeTrialData(); // Add params from $tore
    gameOver();
</script>

<h1 class="flex justify-center text-4xl font-bold transform translate-y-20 ">
    😍 Thanks for playing!!! 😎
</h1>

{#if ($correct / ($correct + $incorrect)) > 0.8}
    <h1 class="flex justify-center text-2xl font-bold transform translate-y-32">
        🫨 Wow, way to go!
    </h1>
{:else if ($correct / ($correct + $incorrect)) > 0.65}
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