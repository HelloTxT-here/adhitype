import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { playKeySound } from '../lib/soundUtils';
import { AlertTriangle, ShieldX } from 'lucide-react';

const Character = React.memo(({ char, status }: { char: string, status: string }) => (
  <span className="relative inline-block">
    <span className={cn(
      status === "untyped" && "text-sub-theme",
      status === "correct" && "text-text-theme",
      status === "incorrect" && "text-error-theme bg-error-theme/20 rounded-sm"
    )}>
      {char}
    </span>
  </span>
));

const Word = React.memo(({ word, typedWord, isCurrentWord, charRefs }: { 
  word: string, 
  typedWord: string, 
  isCurrentWord: boolean,
  charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>
  wordStartIdx: number
}) => {
  return (
    <span className="inline-block mr-[0.4em] pb-1 border-b-2 border-transparent">
      {word.split("").map((char, charIdx) => {
        let status = "untyped";
        if (typedWord !== undefined && charIdx < typedWord.length) {
          status = typedWord[charIdx] === char ? "correct" : "incorrect";
        }
        
        return (
          <Character key={charIdx} char={char} status={status} />
        );
      })}
      
      {/* Extra characters typed beyond the word length */}
      {typedWord !== undefined && typedWord.length > word.length && (
          <span className="text-error-theme opacity-70 bg-error-theme/10">
              {typedWord.substring(word.length).split('').map((char, i) => {
                  return (
                      <span key={`extra-${i}`} className="relative inline-block">
                          {char}
                      </span>
                  );
              })}
          </span>
      )}
    </span>
  );
});

interface TypingAreaProps {
  text: string;
  timeLimit?: number; // in seconds
  onFinish?: (wpm: number, accuracy: number) => void;
  onProgress?: (progress: number, wpm: number) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({ text, timeLimit, onFinish, onProgress }) => {
  const { settings } = useTheme();
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit || 0);
  const [isFailed, setIsFailed] = useState(false);
  const [failReason, setFailReason] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, height: 0 });

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
     setTimeLeft(timeLimit || 0);
  }, [timeLimit]);

  useEffect(() => {
    // initial focus
    setTimeout(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    }, 100);
  }, []);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
     if (startTime && timeLimit && !isFinished) {
         const interval = setInterval(() => {
             const elapsed = Math.floor((Date.now() - startTime) / 1000);
             const remaining = Math.max((timeLimit - elapsed), 0);
             setTimeLeft(remaining);
             
             if (remaining === 0) {
                 finishTest();
             }
         }, 1000);
         return () => clearInterval(interval);
     }
  }, [startTime, timeLimit, isFinished, typed, text]);

  const finishTest = () => {
    setIsFinished(true);
    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
        if (i < text.length && typed[i] === text[i]) {
            correctChars++;
        }
    }
    const finalAcc = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 0;
    
    // WPM calculation: (correct chars / 5) / (minutes elapsed)
    const elapsedMinutes = startTime ? (Date.now() - startTime) / 1000 / 60 : 0.01;
    // For time-limited tests, use the actual time limit if it finished naturally
    const timeToUse = (timeLimit && (timeLeft === 0 || typed.length === text.length)) ? (timeLimit / 60) : elapsedMinutes;
    const finalWpm = Math.round((correctChars / 5) / Math.max(timeToUse, 0.01));
    
    setWpm(finalWpm);
    setAccuracy(finalAcc);

    if (onFinish) {
        onFinish(finalWpm, finalAcc);
    }
  };

  const reset = useCallback(() => {
    setTyped("");
    setStartTime(null);
    setIsFinished(false);
    setIsFailed(false);
    setFailReason("");
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(timeLimit || 0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [timeLimit]);

  // Focus input anywhere on click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Refresh with Tab
      if (e.key === "Tab" && settings.quickRestart) {
        e.preventDefault();
        reset();
      }
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [settings.quickRestart, reset]);

  const [isCapsOn, setIsCapsOn] = useState(false);

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setIsCapsOn(true);
    } else {
      setIsCapsOn(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || isFailed) return;

    const val = e.target.value;
    const oldVal = typed;

    // Confidence Mode: Ignore backspace
    if (settings.confidenceMode && val.length < oldVal.length) {
      return;
    }

    // Play Sound
    if (val.length > oldVal.length) {
      playKeySound(settings.soundType, settings.soundVolume);
    }

    // Don't allow typing more than text length (for now, Monkeytype handles overflow but we limit it)
    if (val.length > text.length) return;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    let correctChars = 0;
    let hasMistake = false;
    let mistakeIndex = -1;
    for (let i = 0; i < val.length; i++) {
        if (i < text.length && val[i] === text[i]) {
            correctChars++;
        } else if (i < text.length) {
            hasMistake = true;
            if (mistakeIndex === -1) mistakeIndex = i;
        }
    }

    if (val.length > oldVal.length) {
        if (settings.stopOnError === 'letter') {
            let oldMistakeIndex = -1;
            for(let i=0; i<oldVal.length; i++) {
                if (oldVal[i] !== text[i]) { oldMistakeIndex = i; break; }
            }
            if (oldMistakeIndex !== -1) {
                if (settings.errorBeep) playKeySound('fail' as any, settings.soundVolume);
                return;
            }
            if (mistakeIndex === val.length - 1 && settings.errorBeep) {
                playKeySound('fail' as any, settings.soundVolume);
            }
        } else if (settings.stopOnError === 'word') {
            if (val.endsWith(" ")) {
                let currentWordStartInVal = oldVal.lastIndexOf(" ") + 1;
                let currentWordInOldVal = oldVal.substring(currentWordStartInVal);
                let currentWordInText = text.substring(currentWordStartInVal).split(" ")[0];
                if (currentWordInOldVal !== currentWordInText) {
                    if (settings.errorBeep) playKeySound('fail' as any, settings.soundVolume);
                    return;
                }
            }
            let oldValWords = oldVal.split(" ");
            let textWords = text.split(" ");
            let oldHasErrorInPrevWords = false;
            for(let i=0; i<oldValWords.length - 1; i++) {
                if(oldValWords[i] !== textWords[i]) { oldHasErrorInPrevWords = true; break; }
            }
            if (oldHasErrorInPrevWords) {
                if (settings.errorBeep) playKeySound('fail' as any, settings.soundVolume);
                return;
            }
            if (mistakeIndex === val.length - 1 && settings.errorBeep) {
                playKeySound('fail' as any, settings.soundVolume);
            }
        } else {
            if (mistakeIndex === val.length - 1 && settings.errorBeep) {
                playKeySound('fail' as any, settings.soundVolume);
            }
        }
    }

    setTyped(val);

    // Difficulty Logic
    if (settings.difficulty === 'master' && hasMistake) {
      playKeySound('fail' as any, settings.soundVolume);
      setIsFailed(true);
      setFailReason("failed: sudden death");
      finishTest();
      return;
    }
    
    // progress
    const progress = Math.min(val.length / text.length, 1);
    
    if (startTime) {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const currentWpm = Math.round((correctChars / 5) / Math.max(timeElapsed, 0.01));
        setWpm(currentWpm);
        
        if (onProgress) {
            onProgress(progress, currentWpm);
        }
    }

    const currentAcc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(currentAcc);

    if (settings.difficulty === 'expert' && currentAcc < 90 && val.length > 10) {
      playKeySound('fail' as any, settings.soundVolume);
      setIsFailed(true);
      setFailReason("failed: accuracy below 90%");
      finishTest();
      return;
    }

    if (val.length === text.length) {
      finishTest();
    }
  };

  // Update caret position
  useEffect(() => {
    if (!textRef.current || isFinished) return;
    
    // This is a more robust way: find the character element at current index
    const characters = textRef.current.querySelectorAll('.relative.inline-block');
    const idx = typed.length;
    
    if (idx < characters.length) {
      const charEl = characters[idx] as HTMLElement;
      setCaretPos({
        left: charEl.offsetLeft,
        top: charEl.offsetTop + (charEl.offsetHeight * 0.1),
        height: charEl.offsetHeight * 0.8
      });
    } else if (characters.length > 0) {
      // Last character (end of test)
      const lastChar = characters[characters.length - 1] as HTMLElement;
      setCaretPos({
        left: lastChar.offsetLeft + lastChar.offsetWidth,
        top: lastChar.offsetTop + (lastChar.offsetHeight * 0.1),
        height: lastChar.offsetHeight * 0.8
      });
    }
  }, [typed, isFinished]);

  const targetWords = useMemo(() => text.split(" "), [text]);
  const typedWords = typed.split(" ");
  
  return (
    <div className="relative w-full max-w-4xl mx-auto cursor-text" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDownInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="absolute bottom-0 opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
      
      {/* Caps Lock Warning */}
      {settings.capsLockWarning && isCapsOn && !isFinished && !isFailed && (
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-[200%] bg-error-theme text-bg-theme px-3 py-1 rounded font-mono text-xs z-20 flex items-center gap-2">
            <AlertTriangle size={12} />
            Caps Lock is ON
         </div>
      )}

      {/* Out of Focus Warning */}
      {settings.outOfFocusWarning && !isFocused && !isFinished && !isFailed && (
        <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm bg-bg-theme/50 rounded-xl cursor-pointer" onClick={() => inputRef.current?.focus()}>
           <div className="flex items-center gap-2 text-text-theme font-mono">
              <AlertTriangle size={16} className="text-main-theme" />
              <span>Click here or press any key to focus</span>
           </div>
        </div>
      )}
      
      {/* Stats during typing */}
      {!isFinished && startTime && (
          <div className="flex gap-12 mb-8 font-mono animate-fade-in opacity-40 hover:opacity-100 transition-opacity">
              {timeLimit && settings.showTimer && (
                 <div>
                    <div className="text-xs opacity-40 uppercase">time</div>
                    <div className="text-4xl text-main-theme">{timeLeft}</div>
                 </div>
              )}
              {!timeLimit && settings.showWpm && (
                 <div>
                    <div className="text-xs opacity-40 uppercase">wpm</div>
                    <div className="text-4xl text-main-theme">{wpm}</div>
                 </div>
              )}
              {!timeLimit && settings.showAccuracy && (
                 <div>
                    <div className="text-xs opacity-40 uppercase">acc</div>
                    <div className="text-4xl text-main-theme">{accuracy}%</div>
                 </div>
              )}
          </div>
      )}

      <div 
        ref={textRef}
        className={cn(
          "typing-text text-sub-theme transition-all whitespace-pre-wrap select-none relative",
          (isFinished || isFailed) ? "opacity-30 blur-md pointer-events-none" : "opacity-100",
          settings.blindMode && !isFinished && !isFailed && "text-opacity-20"
      )}>
        {/* Global Caret */}
        {!isFinished && (
           <div 
             className={cn(
               "absolute z-10",
               settings.caretColor === 'main' ? "bg-main-theme" : 
               settings.caretColor === 'error' ? "bg-error-theme" : 
               settings.caretColor === 'sub' ? "bg-sub-theme" : "bg-text-theme",
               settings.smoothCaret && "transition-all duration-100 ease-out",
               settings.caretStyle === 'line' && "w-[2px]",
               settings.caretStyle === 'block' && "w-[0.6em] opacity-50",
               settings.caretStyle === 'underline' && "h-[2px] w-[0.6em]",
               settings.caretStyle !== 'underline' && "animate-pulse"
             )}
             style={{ 
               left: caretPos.left, 
               top: settings.caretStyle === 'underline' ? caretPos.top + caretPos.height : caretPos.top, 
               height: settings.caretStyle === 'underline' ? 2 : caretPos.height,
               width: settings.caretStyle === 'block' ? '0.6em' : (settings.caretStyle === 'line' ? 2 : '0.6em'),
               opacity: settings.caretStyle === 'block' ? 0.5 : 1
             }}
           />
        )}

        {targetWords.map((word, wordIdx) => {
          const isCurrentWord = wordIdx === typedWords.length - 1;
          const typedWord = isCurrentWord ? (typedWords[wordIdx] || "") : (wordIdx < typedWords.length ? typedWords[wordIdx] : undefined);
          
          return (
             <span key={wordIdx} className={cn("inline-block mr-[0.4em] transition-colors rounded-sm", settings.highlightCurrentWord && isCurrentWord ? "bg-sub-theme/10" : "")}>
                {word.split("").map((char, charIdx) => {
                  let status = "untyped";
                  if (typedWord !== undefined && charIdx < typedWord.length) {
                    status = typedWord[charIdx] === char ? "correct" : "incorrect";
                  }
                  return <Character key={charIdx} char={char} status={status} />;
                })}
                {/* Extra chars */}
                {!settings.hideExtraLetters && typedWord !== undefined && typedWord.length > word.length && (
                    <span className="text-error-theme opacity-70 bg-error-theme/10">
                        {typedWord.substring(word.length).split('').map((char, i) => (
                          <span key={i} className="relative inline-block">{char}</span>
                        ))}
                    </span>
                )}
                {/* Space character after word (except last word) */}
                {wordIdx < targetWords.length - 1 && (
                  <span className={cn(
                    "relative inline-block",
                    (wordIdx < typedWords.length - 1) ? (typed[text.indexOf(' ', text.indexOf(word))] === ' ' ? "text-text-theme" : "text-error-theme bg-error-theme/20") : "text-sub-theme"
                  )}> </span>
                )}
             </span>
          );
        })}
      </div>

      {(isFinished || isFailed) && (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-4 pt-10 z-20"
        >
          {isFailed && (
            <div className="flex flex-col items-center gap-2 mb-4 animate-shake">
                <ShieldX size={48} className="text-error-theme opacity-50" />
                <div className="text-error-theme font-mono uppercase tracking-widest text-sm">{failReason}</div>
            </div>
          )}
          <div className="flex gap-12 font-mono">
             <div className="text-center">
                <div className="text-xs opacity-40 uppercase">wpm</div>
                <div className="text-7xl text-main-theme font-bold">{wpm}</div>
             </div>
             <div className="text-center">
                <div className="text-xs opacity-40 uppercase">acc</div>
                <div className="text-7xl text-main-theme font-bold">{accuracy}%</div>
             </div>
          </div>
          <button 
            onClick={reset}
            className="mt-12 font-mono text-sm opacity-60 hover:opacity-100 hover:text-main-theme flex items-center gap-4 transition-all px-6 py-3 rounded-md hover:bg-main-theme/10 border border-transparent hover:border-main-theme/20"
          >
             <span className="px-2 py-1 rounded bg-sub-theme text-bg-theme text-xs font-bold">TAB</span>
             <span>restart test</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
