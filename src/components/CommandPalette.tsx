import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, themes, ThemeName } from '../context/ThemeContext';
import { Dialog } from '@headlessui/react';
import { Search, Palette, Settings, Navigation, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { currentTheme, setTheme, settings, updateSettings } = useTheme();
  const themeNames = Object.keys(themes);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const commands: Command[] = [
    // Navigation
    { id: 'nav-home', name: 'Home / Practice', icon: <Navigation size={16} />, category: 'Navigation', action: () => navigate('/') },
    { id: 'nav-multiplayer', name: 'Multiplayer Race', icon: <Navigation size={16} />, category: 'Navigation', action: () => navigate('/race') },
    { id: 'nav-leaderboard', name: 'Leaderboard', icon: <Navigation size={16} />, category: 'Navigation', action: () => navigate('/leaderboard') },
    { id: 'nav-profile', name: 'Profile / Account', icon: <Navigation size={16} />, category: 'Navigation', action: () => navigate('/profile') },

    // Theme commands
    ...themeNames.map(theme => ({
      id: `theme-${theme}`,
      name: `Theme: ${theme}`,
      icon: <Palette size={16} />,
      category: 'Theme',
      action: () => setTheme(theme as ThemeName)
    })),

    // Settings Toggle Commands
    { id: 'set-live-wpm', name: `Toggle Live WPM (${settings.showWpm ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ showWpm: !settings.showWpm }) },
    { id: 'set-live-acc', name: `Toggle Live Accuracy (${settings.showAccuracy ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ showAccuracy: !settings.showAccuracy }) },
    { id: 'set-timer', name: `Toggle Timer (${settings.showTimer ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ showTimer: !settings.showTimer }) },
    { id: 'set-smooth-caret', name: `Toggle Smooth Caret (${settings.smoothCaret ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ smoothCaret: !settings.smoothCaret }) },
    { id: 'set-blind-mode', name: `Toggle Blind Mode (${settings.blindMode ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ blindMode: !settings.blindMode }) },
    { id: 'set-freedom-mode', name: `Toggle Freedom Mode (${settings.freedomMode ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ freedomMode: !settings.freedomMode }) },
    { id: 'set-confidence-mode', name: `Toggle Confidence Mode (${settings.confidenceMode ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ confidenceMode: !settings.confidenceMode }) },
    { id: 'set-quick-restart', name: `Toggle Quick Restart (${settings.quickRestart ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ quickRestart: !settings.quickRestart }) },
    { id: 'set-highlight-word', name: `Toggle Highlight Current Word (${settings.highlightCurrentWord ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ highlightCurrentWord: !settings.highlightCurrentWord }) },
    { id: 'set-hide-extra', name: `Toggle Hide Extra Letters (${settings.hideExtraLetters ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ hideExtraLetters: !settings.hideExtraLetters }) },
    { id: 'set-focus-warn', name: `Toggle Out of Focus Warning (${settings.outOfFocusWarning ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ outOfFocusWarning: !settings.outOfFocusWarning }) },
    { id: 'set-caps-warn', name: `Toggle Caps Lock Warning (${settings.capsLockWarning ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ capsLockWarning: !settings.capsLockWarning }) },
    { id: 'set-error-beep', name: `Toggle Error Beep (${settings.errorBeep ? 'On' : 'Off'})`, icon: <Settings size={16} />, category: 'Setting', action: () => updateSettings({ errorBeep: !settings.errorBeep }) },

    // Enums
    ...(['off', 'letter', 'word'] as const).map(s => ({
        id: `stop-error-${s}`,
        name: `Stop On Error: ${s}`,
        icon: <Settings size={16} />,
        category: 'Setting: Behavior',
        action: () => updateSettings({ stopOnError: s })
    })),
    ...(['text', 'main', 'error', 'sub'] as const).map(c => ({
        id: `caret-color-${c}`,
        name: `Caret Color: ${c}`,
        icon: <Settings size={16} />,
        category: 'Setting: Appearance',
        action: () => updateSettings({ caretColor: c })
    })),

    // Difficulty
    ...(['normal', 'expert', 'master'] as const).map(diff => ({
        id: `diff-${diff}`,
        name: `Difficulty: ${diff}`,
        icon: <Settings size={16} />,
        category: 'Setting: Difficulty',
        action: () => updateSettings({ difficulty: diff })
    })),

    // Sound
    ...(['none', 'mechanical', 'clicky', 'pop'] as const).map(sound => ({
        id: `sound-${sound}`,
        name: `Sound: ${sound}`,
        icon: <Volume2 size={16} />,
        category: 'Setting: Sound',
        action: () => updateSettings({ soundType: sound })
    })),
  ];

  const filteredCommands = query === '' 
    ? commands 
    : commands.filter((command) =>
        command.name.toLowerCase().includes(query.toLowerCase()) || 
        command.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-theme/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-bg-theme border border-sub-theme/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-sub-theme/10">
              <Search size={20} className="text-sub-theme" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-text-theme font-mono text-lg placeholder:text-sub-theme/50"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2 command-palette-scroll">
              {filteredCommands.length === 0 ? (
                <div className="px-6 py-8 text-center text-sub-theme font-mono text-sm opacity-50">
                  No commands found.
                </div>
              ) : (
                <div className="flex flex-col gap-1 px-2">
                  {filteredCommands.map((command, idx) => (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors font-mono text-sm",
                        "hover:bg-main-theme hover:text-bg-theme text-text-theme group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sub-theme group-hover:text-bg-theme/70 transition-colors">
                            {command.icon}
                        </span>
                        <span>{command.name}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-sub-theme group-hover:text-bg-theme/50 transition-colors">
                        {command.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-sub-theme/10 bg-sub-theme/5 flex justify-end gap-4 text-[10px] font-mono text-sub-theme uppercase tracking-wider">
               <span><kbd className="bg-bg-theme border border-sub-theme/20 px-1.5 rounded mr-1">↑↓</kbd> to navigate</span>
               <span><kbd className="bg-bg-theme border border-sub-theme/20 px-1.5 rounded mr-1">enter</kbd> to select</span>
               <span><kbd className="bg-bg-theme border border-sub-theme/20 px-1.5 rounded mr-1">esc</kbd> to close</span>
            </div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
