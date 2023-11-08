<script>
    import { Stepper, Step, SlideToggle } from '@skeletonlabs/skeleton';
    import { fade } from 'svelte/transition';
    let locked = false;
    $: unlocked = !locked;

    function onCompleteHandler(e) { 
        console.log('event:complete', e); 
    }
</script>

<div class="flex justify-center translate-y-36">
    <div class="w-1/2 p-4 mb-36 card text-token">
        <Stepper buttonCompleteLabel="Sign in with Google" on:complete={onCompleteHandler}>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>

                <p>Please take note of the following requirements for participating in this study:
                - Age 21-35 (18 for Yale-NUS or NUS students)
                - Color vision (not color blind)
                - Normal or corrected-to-normal vision
                - Using Google Chrome, Firefox, or Safari browser (this survey will not work on Internet Explorer or Microsoft Edge)
                
                If you do not meet these requirements, you are unfortunately not eligible to participate in this survey.
                
                If you meet these requirements, press space bar to proceed.</p>
            </Step>
            <Step locked={unlocked}>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <p>Thank you for your interest in our study!
    
                    Before we begin, we need to obtain your consent to participate. Please read the following information. The main task should take approximately 20 minutes and you will be reimbursed $3.00 for this time based on our rate.
                    Participant Information Sheet: MTURK version
                    
                    You are being invited to participate in a research study. Please read carefully the information provided here. If you agree to participate, please click the icon marked “I agree” below.
                    
                    
                    
                    Study information
                    
                    Protocol Title: Target report during rapid serial stimulus presentations
                    
                    Principal Investigator: Dr. Christopher L. Asplund, Division of Social Sciences, Yale-NUS College (tel: +65 6601 3327, e-mail: chris.asplund@yale-nus.edu.sg)
                    
                    
                    
                    What is the purpose of this research?
                    
                    You are invited to participate in a research study that investigates the effects of various manipulations (instruction, sequential learning, or distraction) on working memory and attention in young, healthy individuals. The long-term goal of the research is to better understand cognitive limitations and flexibility in the domains of visual working memory and attention. This information sheet provides you with information about the research.
                    
                    
                    
                    Who can participate in the research? What is the expected duration of my participation? What is the duration of this research? What is the approximate number of participants involved?
                    
                    Anyone between the ages of 21 and 35 who has normal or corrected-to-normal vision, is not color blind, is fluent in English, and has no history of psychiatric or neurological disorders can participate in the research. Your participation will be on a single-trial basis of no more than 20 minutes. Approximately 1200 participants will take part in this experiment over the course of a year.
                    
                    
                    
                    What will be done if I take part in this research?
                    
                    You will complete 1 session of a computer-based behavioral task, conducted in a location of your choice. You will complete attentional tasks given where your response to stimuli is recorded; and depending on the experiment, some participants will also be asked to complete brief questionnaires. The entire experimental session, including the briefing and consent process, will last no more than 20 minutes .
                    
                    
                    
                    How will my privacy and the confidentiality of my research records be protected?
                    
                    We never receive identifiable data, all of the identifiers being held with Amazon. Non-identifiable data will be kept for a minimum of 10 years, in accordance with National University of Singapore’ Research Data Management Policy.
                    
                    
                    
                    What are the possible discomforts and risks for participants?
                    
                    There are no foreseen discomforts or risks.
                    
                    
                    
                    Will there be reimbursement for participation?
                    
                    Yes, you will be reimbursed at a rate of USD $3 for every 20 minutes of participation in the session.
                    
                    
                    
                    Can I refuse to participate in this research?
                    
                    Yes, you can. Your decision to participate is voluntary, completely up to you. You can also withdraw from the research at any time without giving any reason. Simply close the browser window to do so.
                    
                    
                    
                    Whom should I call if I have any questions or problems?
                    
                    Please contact the Principal Investigator (Dr. Christopher L. Asplund) at +65 6601 3327 or chris.asplund@yale-nus.edu.sg for all research-related matters.
                    
                    For an independent opinion regarding the research and the rights of research participants, you may contact a staff member of the National University of Singapore Institutional Review Board (Attn: Dr. Chan Tuck Wai, at telephone +65 6516 1234 or e-mail at irb@nus.edu.sg).
                    
                    
                    
                    I agree to participate: Yes   (Note: By clicking Yes, you will be taken to the study)
                    
                    
                    Do you consent to participate?
                    Press 'y' for Yes and 'n' for No.
                    Note: By selecting Yes you will be taken to the study.</p>
                    <aside class="alert variant-ghost-warning">
                        <div class="alert-message">
                            <p>Yes <u>{locked ? 'Locked' : 'Unlocked'}</u></p>
                        </div>
                        <div class="alert-actions">
                            <SlideToggle name="locked-state" bind:checked={locked} active="bg-warning-500" />
                        </div>
                    </aside>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <p>At this time, please take a moment to adjust your browser window so that it takes up as much of your screen as possible. Please also take a moment now to close other browser tabs, silence your phone, etc., so that you are not interrupted by any messages mid-experiment. Finally, please switch off any software that might shift the colors of your display (like "Night Shift" in OS X).

                    We humbly ask that you complete the study in a single sitting, so please do your best to stay focused and attentive throughout. Once you begin, please do not use your browser's "Back" button or "Refresh" buttons throughout the study, as this may cause errors, or force you to redo certain sections of the study.
                    
                    Please press the space bar when you are ready to begin.</p>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <p>For each trial, you will see a rapid stream of gray letters inside a gray box. Your task, for every stream, is to detect the designated target letter, which will be the only red letter.
    
                    After you finish viewing each stream, you will be prompted to type in the target letter you saw. Once you input the letter, you will automatically be taken to the next trial. Both capital and lowercase letters will be accepted.
                    
                    If you do not know what the target letter is, you may just input your best guess.
                    
                    Press the space bar to proceed.</p>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <p>Before you begin the real trials, let's practice the task eight times for you to get acquainted with the procedure. For the first four trials, you will be asked to practice the task with slower speed. For the next four trials, you will be asked to practice the task with normal speed. During the practice trials, feedback (i.e., correct or wrong) will be given after answering each question.
    
                    Please watch the video carefully because there will be no opportunity to replay the stream.
                    
                    Press the space bar when you are ready to begin the experiment.</p>
            </Step>
            <Step>
                <svelte:fragment slot="header">Instructions</svelte:fragment>
                <p>We will now begin the main experiment. Please note that unlike the previous practice trial, feedback (i.e., correct or wrong) will NOT be given after answering each question.
    
                    The main experiment will consist of 90 trials.
                    
                    Press any key when you are ready to begin the main experiment.</p>
            </Step>
        </Stepper> 
    </div>
</div>