<script>
    import { Stepper, Step, SlideToggle } from '@skeletonlabs/skeleton';
    import { fly } from 'svelte/transition';
    
    let locked = false;
    $: unlocked = !locked;
    export let signIn;

    function onCompleteHandler(e) { 
        signIn();
    }
</script>

<img src="/lilhalcyon.svg" height="300" width="300">
<div class="flex justify-center translate-y-12">
    <div class="w-3/5 p-4 mb-36 card text-token">
        <Stepper class="m-5" buttonCompleteLabel="Sign in with Google" on:complete={onCompleteHandler}>
            <Step transitionIn={fly}>                
                <svelte:fragment slot="header" >Requirements</svelte:fragment>
                <div in:fly= {{ duration: 600, x: 40 }}>
                    <p>Please take note of the following requirements for participating in this study:</p>
                        <ul class="m-3 list">
                            <li>Age 21-35 (18+ for Yale-NUS or NUS students)</li>                   
                            <li>Color vision (not color blind)</li>
                            <li>Normal or corrected-to-normal vision</li>
                            <li>Using Google Chrome, Firefox, or Safari browser on a desktop or laptop computer</li>
                        </ul>
                    <p>If you do not meet these requirements, you are unfortunately not eligible to participate in this survey.</p>
                    <p>If you meet these requirements, please continue!</p>
                    <br>
                </div>
            </Step>
            <Step locked={unlocked}>
                <svelte:fragment slot="header">Consent</svelte:fragment>
                <div in:fly={{ duration: 600, x: 40 }}>
                    <p>Thank you for your interest in our study!</p>
    
                    <p> Before we begin, we need to obtain your consent to participate. Please read the following information. The main task should take approximately 20 minutes and you will be reimbursed $3.00 for this time based on our rate.</p>               
                    
                    <p>Study information
                    
                    <p>Protocol Title: Target report during rapid serial stimulus presentations</p>
                    
                    <p> Principal Investigator: Dr. Christopher L. Asplund, Division of Social Sciences, Yale-NUS College (tel: +65 6601 3327, e-mail: chris.asplund@yale-nus.edu.sg)</p>
                    
                    <p>What is the purpose of this research?</p>
                    
                    <p>You are invited to participate in a research study that investigates the effects of various manipulations (instruction, sequential learning, or distraction) on working memory and attention in young, healthy individuals. The long-term goal of the research is to better understand cognitive limitations and flexibility in the domains of visual working memory and attention. This information sheet provides you with information about the research.</p>
                    
                    <p>Who can participate in the research? What is the expected duration of my participation? What is the duration of this research? What is the approximate number of participants involved?</p>
                    
                    <p> What will be done if I take part in this research?
                    
                    <p>You will complete 1 session of a computer-based behavioral task, conducted in a location of your choice. You will complete attentional tasks given where your response to stimuli is recorded; and depending on the experiment, some participants will also be asked to complete brief questionnaires. The entire experimental session, including the briefing and consent process, will last no more than 20 minutes .
                    
                    <p>How will my privacy and the confidentiality of my research records be protected?</p>
                    
                    <p>We never receive identifiable data, all of the identifiers being held with Google. Non-identifiable data will be kept for a minimum of 10 years, in accordance with National University of Singapore's Research Data Management Policy.</p>
                    
                    <p>Please contact the Principal Investigator (Dr. Christopher L. Asplund) at +65 6601 3327 or chris.asplund@yale-nus.edu.sg for all research-related matters.</p>
                    
                    <p> For an independent opinion regarding the research and the rights of research participants, you may contact a staff member of the National University of Singapore Institutional Review Board (Attn: Dr. Chan Tuck Wai, at telephone +65 6516 1234 or e-mail at irb@nus.edu.sg).                    
                    
                    <p>Do you consent to participate?</p>
                    <br>
                    <div class="flex justify-end">
                        <aside class=" alert variant-ghost-warning">
                            <div class="alert-message">
                                <p><b>{unlocked ? 'No, I do not' : 'Yes, I do'}</b></p>
                            </div>
                            <div class="alert-actions">
                                <SlideToggle name="locked-state" bind:checked={locked} active="bg-warning-500" />
                            </div>
                        </aside>
                    </div>
                </div>
            </Step>
            <Step>
                <svelte:fragment slot="header">Settings</svelte:fragment>
                <div in:fly= {{ duration: 600, x: 40 }}>
                    <p>At this time, please take a moment to adjust your browser window so that it takes up as much of your screen as possible.</p>
                    <p>Please also take a moment now to close other browser tabs, silence your phone, etc., so that you are not interrupted by any messages mid-experiment. Finally, please switch off any software that might shift the colors of your display (like "Night Shift" in OS X).</p>
                    <p>We humbly ask that you complete the study in a single sitting, so please do your best to stay focused and attentive throughout. Once you begin, please do not use your browser's "Back" button or "Refresh" buttons throughout the study, as this may cause errors, or force you to redo certain sections of the study.</p>
                </div>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <div in:fly= {{ duration: 600, x: 40 }}>
                    <p>For each trial, you will see a rapid stream of gray letters inside a gray box. Your task, for every stream, is to detect the designated target letter, which will be the only red letter.</p>
                    <p>After you finish viewing each stream, you will be prompted to type in the target letter you saw. Once you input the letter, you will automatically be taken to the next trial. Both capital and lowercase letters will be accepted.</p>
                    <p>If you do not know what the target letter is, you may just input your best guess.</p>
                </div>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <div in:fly= {{ duration: 600, x: 40 }}>
                    <p>Before you begin the real trials, let's practice the task eight times for you to get acquainted with the procedure. For the first four trials, you will be asked to practice the task with slower speed. For the next four trials, you will be asked to practice the task with normal speed.</p>
                    <p>During the practice trials, feedback (i.e., correct or wrong) will be given after answering each question.</p>
                </div>
            </Step>
            <Step>
                <svelte:fragment slot="header">Almost there</svelte:fragment>
                <div in:fly= {{ duration: 600, x: 40 }}>
                    <p>We will now begin the main experiment.</p>
                    <p>The main experiment will consist of 90 trials.</p>
                </div>
            </Step>
        </Stepper> 
    </div>
</div>