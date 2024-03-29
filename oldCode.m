function CAS_1_v3_NEW()

% preliminary stuff
clc; % clear command window
close all; % close all open figure windows
%clear all; % clear all variables

%Set up block and trial structures
%Get input, then set variable with upper()
Subject = input('Subject? '); %999;
Session = input('Session? '); %1;
Task = input('Task? ', 's'); %'C';
 
Task = upper(Task(1));

firstPos = [5:7];
singPos = [7:14];
rsvpLength = 16;
rectSize = 80;
rectThick = 10;

rand('seed', round(sum(clock)));

% colour information
backgroundcolor = [130 130 130]; % gray
black = [0 0 0];
white = [255 255 255];
red = [255 0 0];
green = [0 200 0];
other = [0 0 255; 200 200 200; 0 200 200; 200 0 200; 200 200 0; 50 50 50];

%Set up Stimuli
letterSet = ['D', 'F', 'B', 'C', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y', 'W', 'Z'];

% File setup
tm = javax.swing.ToolTipManager.sharedInstance;
javaMethodEDT('setEnabled',tm,false);
start_time = GetSecs;
ds = datestr(now);
ds(ds == ' ') = '_';
ds(ds == '-') = '';
ds(ds == ':') = '';
behavRespName = ['CAS_1_v3_' num2str(Subject) '_' num2str(Session) '_' Task '_' ds '.mat']; % output file structure

% Open a screen
AssertOpenGL;
% screenNumber = max (Screen('Screens'));
whichScreen = 0;
[windows, Rect] = Screen('OpenWindow', whichScreen, [255, 255, 255]);
Screen('Flip', windows); % Do initial flip so that you draw on background and not on programming screen
Screen('FillRect', windows, backgroundcolor, Rect);
Screen('Flip', windows); % blank gray screen

% get refresh rate, height & width for screen being used
refreshrate = Screen('NominalFrameRate', windows); % returns nominal frame rate, rounded to the closest integral value
[width, height] = Screen('WindowSize', windows);

% find the center of the screen
ScreenRect = Rect;
ScreenLeft = Rect(RectLeft); % returns the Rect index of left side of screen
ScreenRight = Rect(RectRight);
ScreenTop = Rect(RectTop);
ScreenBottom = Rect(RectBottom);

DisplayCenter = [0, 0]; % defines the center of the display box
yCenter = (ScreenBottom - ScreenTop)/2; % 540 (originally)
xCenter = (ScreenRight - ScreenLeft)/2; % 960 (originally)
vertical_offset = 0; % offset from DisplayCenter
horizontal_offset = 0; % SetRect creates a Rect with specified coordinates LTRB

KbName ('UnifyKeyNames'); % make sure keyboard mapping is the same on all supported OS
Screen('Preference', 'SuppressAllWarnings', 1); % as it says
Screen('Preference', 'SkipSyncTests', 1); % skip sync test to avoid crashes during development

fontSize = 35;
Screen('TextFont', windows, 'Courier New'); % choose font type
Screen('TextSize', windows, fontSize); % choose font size
Screen('TextStyle', windows, 1); % choose font style: 1=bold

for j = 1:150,
    image = imread(['Face_Stimuli/' num2str(j*2-2) '.jpg']);
    surText{j} = Screen('MakeTexture', windows, image);
end

HideCursor;
WaitSecs(2);

if Task == 'B' || Task == 'C',
    nblocks = 2;
    [nx, ny, bbox] = DrawFormattedText(windows, ...
        ['Report the red letter in each stream when prompted.\n\n' ...
        'If you are unsure, please make your best guess.\n\n' ...
        'Press any key to begin.'], 'center', 'center', white);
else
    nblocks = 1;
    [nx, ny, bbox] = DrawFormattedText(windows, ...
        ['Report the two red letters in each stream when prompted.\n\n' ...
        'If you are unsure, please make your best guess.\n\n' ...
        'Press any key to begin.'], 'center', 'center', white);
end

Screen('Flip', windows);
WaitSecs(1);
FlushEvents('keyDown');
GetChar;
Screen('FillRect', windows, backgroundcolor, Rect);
Screen('Flip', windows); % blank gray screen


%And begin the trial sequence!



surTrials1 = Shuffle([1 1 1 1 1 1 repmat(0,1,52)]);
while sum((surTrials1(1:end-2) & surTrials1(2:end-1)) | ...
        (surTrials1(1:end-2) & surTrials1(3:end)) | ...
        (surTrials1(2:end-1) & surTrials1(3:end))) > 0,
    surTrials1 = Shuffle([1 1 1 1 1 1 repmat(0,1,52)]);
end
surTrials2 = Shuffle([1 1 1 1 1 1 repmat(0,1,52)]);
while sum((surTrials2(1:end-2) & surTrials2(2:end-1)) | ...
        (surTrials2(1:end-2) & surTrials2(3:end)) | ...
        (surTrials2(2:end-1) & surTrials2(3:end))) > 0,
    surTrials2 = Shuffle([1 1 1 1 1 1 repmat(0,1,52)]);
end

block0 = repmat(0,1,8);
block1 = [0 0 surTrials1 repmat(0,1,36)];
block2 = [repmat(0,1,36) surTrials2 0 0];
Output.block0 = block0;
Output.block1 = block1;
Output.block2 = block2;
    
for b = 1:nblocks+1,
    lagMatrix = [];
    distMatrix = [];
    
    if b == 1,
        ntrials = 8;
    else
        ntrials = 96;
    end
    
    switch Task
        case 'A',
            lag_short = 3; lag_long = 8;
            lagMatrix = [repmat(lag_short,1,ntrials/2) repmat(lag_long,1,ntrials/2)];
        case 'B',
            junk = 888;
        case 'C',
            lag_short = 3; lag_long = 8;
            lagMatrix = [repmat(lag_short,1,ntrials/2) repmat(lag_long,1,ntrials/2)];
            distMatrix = [repmat(1,1,ntrials/4), repmat(0,1,ntrials/4), ...
                repmat(1,1,ntrials/4), repmat(0,1,ntrials/4)];
        case 'D',
            distMatrix = [repmat(1,1,ntrials/2) repmat(0,1,ntrials/2)];
            lagMatrix = repmat(4,1,ntrials);
        %case 'E',
        %    lag_short = 3; lag_long = 8;
        %    lagMatrix = [repmat(lag_short,1,ntrials/2) repmat(lag_long,1,ntrials/2)];            
    end
    
    
    Output.lagMatrix{b} = lagMatrix;
    Output.distMatrix{b} = distMatrix;

    trialSeq = Shuffle(1:ntrials);
    Output.trialSeq{b} = trialSeq;

    for t = 1:length(trialSeq),
        rsvpSeq = Shuffle(letterSet);
        rsvpSeq = rsvpSeq(1:rsvpLength);
        targPos = []; targID = [];
        switch Task
            case 'A', % AB
                temp = Shuffle(firstPos);
                targPos(1) = temp(1);
                targPos(2) = targPos(1) + lagMatrix(trialSeq(t));
                targID = rsvpSeq(targPos);
            case 'E',
                temp = Shuffle(firstPos);
                targPos(1) = temp(1);
                targPos(2) = targPos(1) + lagMatrix(trialSeq(t));
                targID = rsvpSeq(targPos);
            case 'D', % AB with distractor
                temp = Shuffle(firstPos);
                targPos(1) = temp(1);
                targPos(2) = targPos(1) + lagMatrix(trialSeq(t));
                targID = rsvpSeq(targPos);
                if distMatrix(trialSeq(t)),
                    rsvpSeq(targPos(1)+2) = targID(2);
                end  
            case 'C', % CC
                temp = Shuffle(firstPos);
                targPos(1) = temp(1);
                targPos(2) = targPos(1) + lagMatrix(trialSeq(t));
                targID = rsvpSeq(targPos);
            case 'B', % SiB
                temp = Shuffle(singPos);
                targPos(1) = temp(1) - 3;
                targPos(2) = temp(1);
                targID = rsvpSeq(targPos);
        end
        Output.rsvpSeq{b,t} = rsvpSeq;
        Output.targPos(b,t,:) = targPos;
        Output.targID(b,t,:) = targID;
        
        %Actual trial code
        
        distRect = [xCenter-(rectSize/2) yCenter-(rectSize/2) xCenter+(rectSize/2) yCenter+(rectSize/2)];
        distRect2 = distRect;
       
        
        Screen('TextSize', windows, fontSize*2); % choose font size
        WaitSecs(0.6);
        Screen('FrameRect', windows, white, distRect, rectThick);
        Screen('Flip', windows);
        WaitSecs(0.4);
        startClock = GetSecs;
        
        for itemPos = 1:length(rsvpSeq),
            temp = Shuffle(1:size(other,1));
            itemColor = temp(1);
            Screen('FrameRect', windows, white, distRect, rectThick);
            s_now = 0;
            c_now = 0;
            if itemPos == targPos(1),
                switch Task,
                    case 'A',
                        [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', red);
                    case 'E',
                        [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', red);                        
                    case 'B',
                        switch b,
                            case 1,
                                if block0(t) > 0,
                                    temp = Shuffle(1:150);
                                    Screen('DrawTexture', windows, surText{temp(1)}, [], distRect2);
                                    s_now = 1;
                                else
                                    [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', other(itemColor, :));
                                end
                            case 2,
                                if block1(t) > 0,
                                    temp = Shuffle(1:150);
                                    Screen('DrawTexture', windows, surText{temp(1)}, [], distRect2);
                                    s_now = 1;
                                else
                                    [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', other(itemColor, :));
                                end
                            case 3,
                                if block2(t) > 0,
                                    temp = Shuffle(1:150);
                                    Screen('DrawTexture', windows, surText{temp(1)}, [], distRect2);
                                    s_now = 1;
                                else
                                    [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', other(itemColor, :));
                                end
                        end
                    case 'C',
                        [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', other(itemColor, :));                 
                        if distMatrix(trialSeq(t)),
                            Screen('FrameRect', windows, red, distRect, rectThick);
                        else
                            Screen('FrameRect', windows, green, distRect, rectThick);
                        end
                        c_now = 1;
                    case 'D',
                        [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', red);
                end
            elseif itemPos == targPos(2),
                [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', red);
            else
                [nx, ny, bbox] = DrawFormattedText(windows, rsvpSeq(itemPos), 'center', 'center', other(itemColor, :));
            end
 
            Screen('Flip', windows, startClock + (itemPos-1)*0.1);
            
            if Task == 'A' || Task == 'B' || Task == 'C' || Task == 'D',
                Screen('FrameRect', windows, white, distRect, rectThick);
                if s_now,
                    Screen('DrawTexture', windows, surText{temp(1)}, [], distRect2);
                end
                if c_now,
                    if distMatrix(trialSeq(t)),
                        Screen('FrameRect', windows, red, distRect, rectThick);
                    else
                        Screen('FrameRect', windows, green, distRect, rectThick);
                    end
                end
                Screen('Flip', windows, startClock + (itemPos-1)*0.1+0.05);
            end
            
        end
        Screen('FillRect', windows, backgroundcolor, Rect);
        Screen('Flip', windows, startClock + (itemPos)*0.1);
        
        WaitSecs(0.2);
        Screen('TextSize', windows, fontSize); % choose font size
        
        
        %Gather responses
        if Task == 'A' || Task == 'D' || Task == 'E',
            [nx, ny, bbox] = DrawFormattedText(windows, 'First target?', 'center', 'center', white);
            Screen('Flip', windows);
            FlushEvents('keyDown');
            Output.resp1{b,t} = GetChar;
            [nx, ny, bbox] = DrawFormattedText(windows, 'Second target?', 'center', 'center', white);
            Screen('Flip', windows);
            FlushEvents('keyDown');
            Output.resp2{b,t} = GetChar;
        else
            [nx, ny, bbox] = DrawFormattedText(windows, 'Target?', 'center', 'center', white);
            Screen('Flip', windows);
            FlushEvents('keyDown');
            Output.resp1{b,t} = GetChar;
            Output.resp2{b,t} = '#';
        end
        
        Screen('FillRect', windows, backgroundcolor, Rect);
        Screen('Flip', windows); % blank gray screen
        
        %End of trial save
        save(behavRespName, 'Output');
    end
    
    %End of block messages
    if b == 1,
        [nx, ny, bbox] = DrawFormattedText(windows, 'Press any key to continue with the real experiment.', 'center', 'center', white);
    elseif b == 2 && nblocks == 2,
        [nx, ny, bbox] = DrawFormattedText(windows, 'Please take a short break. \n\n Press any key to continue.', 'center', 'center', white);
    else,
        [nx, ny, bbox] = DrawFormattedText(windows, 'You have completed this task. \n\n Please notify experimenter.', 'center', 'center', white);
    end
    Screen('Flip', windows);
    WaitSecs(0.5);
    FlushEvents('keyDown');
    GetChar;
    Screen('FillRect', windows, backgroundcolor, Rect);
    Screen('Flip', windows); % blank gray screen
end


Screen('closeall');
for i = 1:1000,
    ShowCursor;
end
fclose('all');

%end

