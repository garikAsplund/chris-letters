import { randomRange, DISTRACTORS, LETTERS, NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';

export function createABTrials() {
    const ABLetters = [];
    const ABTargets = [];
    const ABTextColors = [];
        
    while (ABLetters.length < NUMBER_OF_TRIALS) {
        
        const ABLettersTrial = [];
        const ABTargetsTrial = [];
        const ABTextColorsTrial = [];

        let targetOffset = Math.random() < 0.5 ?  3 : 8;

        let targetIndex = 4;
        let T1Index = targetIndex + randomRange(3);
        let T2Index = T1Index + targetOffset; 

        while(ABLettersTrial.length < 16) {
            let letterToAdd = randomRange(LETTERS.length - 1);
            
            if (ABLettersTrial[ABLettersTrial.length - 1] === LETTERS[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % LETTERS.length;
            }
           
            if (ABTargetsTrial.length === T1Index || ABTargetsTrial.length === T2Index) {
                ABTargetsTrial.push(true);
                ABTextColorsTrial.push('red');
            } else {
                ABTargetsTrial.push(false);
                ABTextColorsTrial.push(DISTRACTORS[randomRange(6) - 1]);
            }

            ABLettersTrial.push(LETTERS[letterToAdd]);
        }
 
        ABLetters.push(ABLettersTrial);
        ABTargets.push(ABTargetsTrial);
        ABTextColors.push(ABTextColorsTrial);
    }
    
    return {
            ABLetters,
            ABTargets,
            ABTextColors,
        }
}