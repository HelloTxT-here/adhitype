import React from 'react';
import { useTheme, themes, ThemeName } from '../context/ThemeContext';
import { X, Type, Layout, Palette, MousePointer2, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, settings, updateSettings } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-theme/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-bg-theme border border-sub-theme/20 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-theme flex items-center gap-3">
                <Settings2 className="text-main-theme" /> settings
              </h2>
              <button 
                onClick={onClose}
                className="text-sub-theme hover:text-text-theme transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-10">
              {/* Theme Section */}
              <section>
                <h3 className="text-sm font-mono uppercase tracking-widest text-sub-theme mb-4 flex items-center gap-2">
                  <Palette size={16} /> appearance
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(themes).map((name) => (
                    <button
                      key={name}
                      onClick={() => setTheme(name as ThemeName)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        currentTheme.name === name 
                          ? "border-main-theme bg-main-theme/5" 
                          : "border-sub-theme/10 hover:border-text-theme/30"
                      )}
                      style={{ backgroundColor: themes[name as ThemeName].bg }}
                    >
                      <div className="text-xs font-bold mb-2 uppercase" style={{ color: themes[name as ThemeName].text }}>
                        {name.replace('-', ' ')}
                      </div>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themes[name as ThemeName].main }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: themes[name as ThemeName].sub }} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Typography Section */}
              <section>
                <h3 className="text-sm font-mono uppercase tracking-widest text-sub-theme mb-4 flex items-center gap-2">
                  <Type size={16} /> typography
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs text-sub-theme mb-2">font family</label>
                    <div className="flex bg-sub-theme/10 rounded-md p-1">
                      {(['mono', 'sans', 'serif'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => updateSettings({ fontFamily: f })}
                          className={cn(
                            "flex-1 py-2 text-xs rounded transition-all",
                            settings.fontFamily === f ? "bg-main-theme text-bg-theme font-bold" : "text-sub-theme hover:text-text-theme"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-sub-theme mb-2">font size ({settings.fontSize}px)</label>
                    <input 
                      type="range" 
                      min="16" 
                      max="48" 
                      step="4"
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                      className="w-full accent-main-theme"
                    />
                  </div>
                </div>
              </section>

              {/* Behavior Section */}
              <section>
                <h3 className="text-sm font-mono uppercase tracking-widest text-sub-theme mb-4 flex items-center gap-2">
                  <Layout size={16} /> interface
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                   <div>
                    <label className="block text-xs text-sub-theme mb-2">caret style</label>
                    <div className="flex bg-sub-theme/10 rounded-md p-1">
                      {(['line', 'block', 'underline'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ caretStyle: s })}
                          className={cn(
                            "flex-1 py-1 px-3 text-xs rounded transition-all",
                            settings.caretStyle === s ? "bg-main-theme text-bg-theme font-bold" : "text-sub-theme hover:text-text-theme"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SettingToggle 
                      label="smooth caret" 
                      active={settings.smoothCaret} 
                      onToggle={() => updateSettings({ smoothCaret: !settings.smoothCaret })} 
                    />
                    <SettingToggle 
                      label="blind mode" 
                      active={settings.blindMode} 
                      onToggle={() => updateSettings({ blindMode: !settings.blindMode })} 
                    />
                  </div>

                  <div className="space-y-4">
                    <SettingToggle 
                      label="live wpm" 
                      active={settings.showWpm} 
                      onToggle={() => updateSettings({ showWpm: !settings.showWpm })} 
                    />
                    <SettingToggle 
                      label="live accuracy" 
                      active={settings.showAccuracy} 
                      onToggle={() => updateSettings({ showAccuracy: !settings.showAccuracy })} 
                    />
                    <SettingToggle 
                      label="show timer" 
                      active={settings.showTimer} 
                      onToggle={() => updateSettings({ showTimer: !settings.showTimer })} 
                    />
                  </div>

                  <div className="space-y-4">
                    <SettingToggle 
                      label="confidence mode" 
                      active={settings.confidenceMode} 
                      onToggle={() => updateSettings({ confidenceMode: !settings.confidenceMode })} 
                      description="forbid backspace"
                    />
                    <SettingToggle 
                      label="freedom mode" 
                      active={settings.freedomMode} 
                      onToggle={() => updateSettings({ freedomMode: !settings.freedomMode })} 
                      description="delete any character"
                    />
                    <SettingToggle 
                      label="quick restart" 
                      active={settings.quickRestart} 
                      onToggle={() => updateSettings({ quickRestart: !settings.quickRestart })} 
                      description="press tab to reset"
                    />
                    <SettingToggle 
                      label="highlight current word" 
                      active={settings.highlightCurrentWord} 
                      onToggle={() => updateSettings({ highlightCurrentWord: !settings.highlightCurrentWord })} 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <SettingToggle 
                      label="hide extra letters" 
                      active={settings.hideExtraLetters} 
                      onToggle={() => updateSettings({ hideExtraLetters: !settings.hideExtraLetters })} 
                    />
                    <SettingToggle 
                      label="out of focus warning" 
                      active={settings.outOfFocusWarning} 
                      onToggle={() => updateSettings({ outOfFocusWarning: !settings.outOfFocusWarning })} 
                    />
                    <SettingToggle 
                      label="caps lock warning" 
                      active={settings.capsLockWarning} 
                      onToggle={() => updateSettings({ capsLockWarning: !settings.capsLockWarning })} 
                    />
                    <SettingToggle 
                      label="error beep" 
                      active={settings.errorBeep} 
                      onToggle={() => updateSettings({ errorBeep: !settings.errorBeep })} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                  <div>
                    <label className="block text-xs font-mono text-sub-theme mb-2">style: caret color</label>
                    <div className="flex bg-sub-theme/10 rounded-md p-1 min-h-[40px]">
                      {(['text', 'main', 'error', 'sub'] as const).map(c => (
                        <button
                          key={c}
                          onClick={() => updateSettings({ caretColor: c })}
                          className={cn(
                            "flex-1 py-1 px-3 text-xs font-mono rounded transition-all",
                            settings.caretColor === c ? "bg-main-theme text-bg-theme font-bold" : "text-sub-theme hover:text-text-theme"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-sub-theme mb-2">behavior: stop on error</label>
                    <div className="flex bg-sub-theme/10 rounded-md p-1 min-h-[40px]">
                      {(['off', 'letter', 'word'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ stopOnError: s })}
                          className={cn(
                            "flex-1 py-1 px-3 text-xs font-mono rounded transition-all",
                            settings.stopOnError === s ? "bg-main-theme text-bg-theme font-bold" : "text-sub-theme hover:text-text-theme"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Sound Section */}
              <section>
                <h3 className="text-sm font-mono uppercase tracking-widest text-sub-theme mb-4 flex items-center gap-2">
                  <MousePointer2 size={16} /> sound
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs text-sub-theme mb-2">key sound</label>
                    <div className="flex bg-sub-theme/10 rounded-md p-1 min-h-[40px]">
                      {(['none', 'mechanical', 'clicky', 'pop'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ soundType: s })}
                          className={cn(
                            "flex-1 py-1 px-3 text-xs rounded transition-all",
                            settings.soundType === s ? "bg-main-theme text-bg-theme font-bold" : "text-sub-theme hover:text-text-theme"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-sub-theme mb-2">volume ({Math.round(settings.soundVolume * 100)}%)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={settings.soundVolume}
                      onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                      className="w-full accent-main-theme"
                    />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SettingToggle = ({ label, active, onToggle, description }: { label: string, active: boolean, onToggle: () => void, description?: string }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div className="flex flex-col">
      <span className="text-sm text-sub-theme group-hover:text-text-theme transition-colors">{label}</span>
      {description && <span className="text-[10px] text-sub-theme opacity-50 uppercase">{description}</span>}
    </div>
    <div 
      onClick={onToggle}
      className={cn(
        "w-10 h-6 rounded-full relative transition-all duration-300",
        active ? "bg-main-theme" : "bg-sub-theme/30"
      )}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
        active ? "left-5" : "left-1"
      )} />
    </div>
  </label>
);
