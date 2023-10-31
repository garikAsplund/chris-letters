import { randomRange, DISTRACTORS, LETTERS, NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';

export function createCCTrials() {
    const CCLetters = [];
    const CCTargets = [];
    const CCTextColors = [];
    const CCBoxColors = [];
    
    while (CCLetters.length < NUMBER_OF_TRIALS) {
        const CCLettersTrial = [];
        const CCTargetsTrial = [];
        const CCTextColorsTrial = [];
        const CCBoxColorsTrial = [];

        let targetOffset = Math.random() < 0.5 ?  3 : 8;
        let distractorIndex;

        let targetIndex = 4;
        distractorIndex = targetIndex + randomRange(3);
        targetIndex = distractorIndex + targetOffset;

        while(CCLettersTrial.length < 16) {
            let letterToAdd = randomRange(LETTERS.length - 1);
            
            if (CCLettersTrial[CCLettersTrial.length - 1] === LETTERS[letterToAdd]) {
                letterToAdd = (letterToAdd + 1) % LETTERS.length;
            }
           
            if (CCTargetsTrial.length === targetIndex) {
                CCTargetsTrial.push(true);
                CCTextColorsTrial.push('red');
            } else {
                CCTargetsTrial.push(false);
                CCTextColorsTrial.push(DISTRACTORS[randomRange(6) - 1]);
            }

            if (CCTargetsTrial.length === distractorIndex) {
                CCBoxColorsTrial.push(Math.random() < 0.5 ? 'red' : 'green');
            } else {
                CCBoxColorsTrial.push('white');
            }

            CCLettersTrial.push(LETTERS[letterToAdd]);
        }

        CCLetters.push(CCLettersTrial);
        CCTargets.push(CCTargetsTrial);
        CCTextColors.push(CCTextColorsTrial);
        CCBoxColors.push(CCBoxColorsTrial);
    }
    
    return {
        CCLetters,
        CCTargets,
        CCTextColors,
        CCBoxColors,
    }
}