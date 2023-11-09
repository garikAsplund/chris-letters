export function stream(trialType) {
    const currentTime = performance.now();

    if ($numberOfFlashes > 32) {
        $startTime = Date.now();
        setTimeout(() => {
            $inProgress = false;;
        }, 600);
        $displayFace = false;
        return;
    }

    if (++$count % (Math.floor(50 / Math.floor(1000 / $refreshRate))) === 0) {
        $isOn = !$isOn;
        $numberOfFlashes++;
        
        if ($isOn) {
            $currentLetter = trialType.letters[$currentTrial - 1][($numberOfFlashes / 2) - 1];
            $textColor = trialType.textColors[$currentTrial - 1][($numberOfFlashes / 2) - 1];
            $isTarget = trialType.targets[$currentTrial - 1][($numberOfFlashes / 2) - 1];
            $boxColor = trialType.boxColors[$currentTrial - 1][($numberOfFlashes / 2) - 1];
            $displayFace = trialType.surprise[$currentTrial - 1][($numberOfFlashes / 2) - 1];
                
            if ($isTarget) {
                $targetLetter += $currentLetter;
            }  
        } else {
            $currentLetter = ' ';
            $displayFace = trialType.surprise[$currentTrial - 1][(($numberOfFlashes - 1) / 2) - 1];   
        }

        $lastTime = currentTime;
    }

    requestAnimationFrame(stream);
}