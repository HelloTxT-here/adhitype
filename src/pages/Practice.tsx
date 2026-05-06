import React, { useState, useEffect } from 'react';
import { TypingArea } from '../components/TypingArea';
import { generateText } from '../lib/typingUtils';
import { motion } from 'motion/react';
import { Globe, AtSign, Hash, Clock, Type, Quote, Settings2, PenTool, Wrench, RefreshCw, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { saveRaceStats } from '../lib/firebaseUtils';
import { useTheme } from '../context/ThemeContext';

const commonQuotes = [
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    "Stay hungry, stay foolish.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Believe you can and you're halfway there.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export const Practice: React.FC = () => {
    const { settings, updateSettings } = useTheme();
    const [wordCount, setWordCount] = useState(25);
    const [timeLimit, setTimeLimit] = useState(15);
    const [mode, setMode] = useState<'words' | 'time' | 'quote'>('words'); 
    const [punctuation, setPunctuation] = useState(false);
    const [numbers, setNumbers] = useState(false);
    
    const [text, setText] = useState("");
    const [key, setKey] = useState(0);

    const wordsOptions = [10, 25, 50, 100];
    const timeOptions = [15, 30, 60, 120];

    const difficultyIcons = {
        normal: <Shield size={12} />,
        expert: <ShieldCheck size={12} />,
        master: <ShieldAlert size={12} />
    };

    useEffect(() => {
        if (mode === 'quote') {
            const q = commonQuotes[Math.floor(Math.random() * commonQuotes.length)];
            setText(q);
        } else {
            const count = mode === 'time' ? 100 : wordCount;
            setText(generateText({ wordCount: count, punctuation, numbers }));
        }
    }, [wordCount, timeLimit, mode, punctuation, numbers]);

    const handleRestart = () => {
        const count = mode === 'time' ? 100 : wordCount;
        setText(generateText({ wordCount: count, punctuation, numbers }));
        setKey(k => k + 1);
    };

    const handleFinish = async (wpm: number, accuracy: number) => {
        await saveRaceStats(wpm, accuracy, 'practice');
    };

    return (
        <div className="flex flex-col items-center flex-1 w-full max-w-5xl mx-auto">
             <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center gap-6 mt-8 mb-20 w-full"
             >
                 <div className="flex flex-wrap items-center justify-center gap-4 text-sub-theme font-mono text-xs">
                     <div className="flex bg-bg-theme border border-white/5 rounded-md px-1 py-1 shadow-sm">
                         <button 
                             onClick={() => setPunctuation(!punctuation)}
                             className={cn("flex items-center gap-2 px-3 py-1 transition-colors rounded", punctuation ? "text-main-theme" : "hover:text-text-theme")}
                         >
                             <AtSign size={12} /> punctuation
                         </button>
                         <button 
                             onClick={() => setNumbers(!numbers)}
                             className={cn("flex items-center gap-2 px-3 py-1 transition-colors rounded", numbers ? "text-main-theme" : "hover:text-text-theme")}
                         >
                             <Hash size={12} /> numbers
                         </button>
                     </div>

                     <div className="flex bg-bg-theme border border-white/5 rounded-md px-1 py-1 shadow-sm">
                         <button 
                             onClick={() => setMode('time')}
                             className={cn("flex items-center gap-2 px-3 py-1 transition-colors rounded", mode === 'time' ? "text-main-theme shadow-inner bg-sub-theme/10" : "hover:text-text-theme")}
                         >
                             <Clock size={12} /> time
                         </button>
                         <button 
                             onClick={() => setMode('words')}
                             className={cn("flex items-center gap-2 px-3 py-1 transition-colors rounded", mode === 'words' ? "text-main-theme shadow-inner bg-sub-theme/10" : "hover:text-text-theme")}
                         >
                             <Type size={12} /> words
                         </button>
                         <button 
                             onClick={() => setMode('quote')}
                             className={cn("flex items-center gap-2 px-3 py-1 transition-colors rounded", mode === 'quote' ? "text-main-theme shadow-inner bg-sub-theme/10" : "hover:text-text-theme")}
                         >
                             <Quote size={12} /> quote
                         </button>
                     </div>

                     <div className="flex bg-bg-theme border border-white/5 rounded-md px-1 py-1 shadow-sm">
                         {(['normal', 'expert', 'master'] as const).map(diff => (
                              <button 
                                 key={diff}
                                 onClick={() => updateSettings({ difficulty: diff })}
                                 className={cn(
                                     "flex items-center gap-2 px-3 py-1 transition-colors rounded", 
                                     settings.difficulty === diff ? "text-main-theme shadow-inner bg-sub-theme/10" : "hover:text-text-theme"
                                 )}
                             >
                                 {difficultyIcons[diff]} {diff}
                             </button>
                         ))}
                     </div>

                     <div className="flex bg-bg-theme border border-white/5 rounded-md px-1 py-1 shadow-sm">
                         {mode === 'time' ? (
                             timeOptions.map(t => (
                                 <button
                                     key={t}
                                     onClick={() => setTimeLimit(t)}
                                     className={cn(
                                         "px-3 py-1 rounded transition-colors",
                                         timeLimit === t ? "text-main-theme bg-sub-theme/5" : "hover:text-text-theme"
                                     )}
                                 >
                                     {t}
                                 </button>
                             ))
                         ) : mode === 'words' ? (
                             wordsOptions.map(count => (
                                 <button
                                     key={count}
                                     onClick={() => setWordCount(count)}
                                     className={cn(
                                         "px-3 py-1 rounded transition-colors",
                                         wordCount === count ? "text-main-theme bg-sub-theme/5" : "hover:text-text-theme"
                                     )}
                                 >
                                     {count}
                                 </button>
                             ))
                         ) : null}
                         <button className="flex items-center gap-2 px-3 py-1 hover:text-text-theme transition-colors rounded px-2 opacity-60">
                             <Wrench size={12} />
                         </button>
                     </div>
                 </div>

                 <div className="flex items-center gap-2 text-sub-theme font-mono text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                     <Globe size={12} /> english
                 </div>
             </motion.div>

             <TypingArea 
                key={key} 
                text={text} 
                onFinish={handleFinish} 
                timeLimit={mode === 'time' ? timeLimit : undefined}
             />

             <div className="mt-20 flex justify-center pb-20">
                 <button 
                    onClick={handleRestart}
                    className="text-sub-theme hover:text-text-theme transition-all p-3 rounded-full hover:bg-sub-theme/10 group"
                    title="Restart Test"
                 >
                     <RefreshCw size={24} className="group-active:rotate-180 transition-transform duration-300" />
                 </button>
             </div>
        </div>
    );
};
