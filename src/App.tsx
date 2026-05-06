import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Practice } from './pages/Practice';
import { Race } from './pages/Race';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { AuthProvider, useAuth } from './firebase/AuthContext';
import { loginWithGoogle, logout } from './firebase/config';
import { Search, Info, Settings, Trophy, Keyboard, UserCircle, LogOut, Bell, Mail, Heart, Github, FileText, Shield, Lock, Palette, GitBranch, Flag } from 'lucide-react';
import { cn } from './lib/utils';

import { useTheme, themes, ThemeName } from './context/ThemeContext';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';

const Navbar = () => {
    const { user, userData } = useAuth();
    const location = useLocation();
    const { currentTheme } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    return (
        <nav className="flex items-center justify-between py-6 max-w-5xl mx-auto w-full px-6 text-sub-theme relative z-40">
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2 group pr-4 relative -top-1">
                    <div className="text-main-theme font-bold text-2xl flex flex-col items-center justify-center leading-none">
                        <span className="text-[9px] mb-[-4px] tracking-tight text-sub-theme self-start ml-0.5">adhi type</span>
                        <div className="flex items-center gap-2 mt-1">
                            <svg width="28" height="20" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-main-theme">
                                <rect x="2" y="2" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2.5"/>
                                <path d="M8 8V16M16 8V16M24 8V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                                <circle cx="24" cy="12" r="1.5" fill="currentColor"/>
                            </svg>
                            <span className="text-3xl font-sans font-bold tracking-tight text-text-theme">adhitype</span>
                        </div>
                    </div>
                </Link>

                <nav className="flex items-center gap-4">
                    <Link to="/" className={cn("hover:text-text-theme transition-colors", location.pathname === '/' && 'text-text-theme')} title="Practice">
                        <Keyboard size={20} strokeWidth={2.5} />
                    </Link>
                    <Link to="/race" className={cn("hover:text-text-theme transition-colors", location.pathname === '/race' && 'text-text-theme')} title="Multiplayer Race">
                        <Flag size={20} strokeWidth={2.5} />
                    </Link>
                    <Link to="/leaderboard" className={cn("hover:text-text-theme transition-colors", location.pathname === '/leaderboard' && 'text-text-theme')} title="Leaderboard">
                        <Trophy size={19} strokeWidth={2.5} />
                    </Link>
                    <button className="hover:text-text-theme transition-colors">
                        <Info size={19} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="hover:text-text-theme transition-colors group">
                        <Settings size={19} strokeWidth={2.5} className="group-hover:rotate-45 transition-transform duration-300" />
                    </button>
                </nav>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <div className="flex items-center gap-6 font-mono text-sm">
                <button className="hover:text-text-theme transition-colors">
                    <Bell size={18} strokeWidth={2.5} />
                </button>
                {user ? (
                    <div className="flex items-center gap-3">
                        <Link to="/profile" className="flex items-center gap-2 hover:text-text-theme transition-colors group" title="Account Settings">
                            <UserCircle size={18} strokeWidth={2.5} className="group-hover:text-main-theme transition-colors" />
                            <span>{userData?.displayName || user.displayName}</span>
                            <span className="bg-bg-theme opacity-80 text-sub-theme px-1.5 py-0.5 rounded text-[10px] ml-1 border border-sub-theme/20 group-hover:border-main-theme/50 transition-colors">
                                {userData?.wpmRecord ? Math.floor(userData.wpmRecord) : 0}
                            </span>
                        </Link>
                        <button onClick={logout} className="ml-2 opacity-40 hover:opacity-100 hover:text-red-400 transition-all">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <button onClick={loginWithGoogle} className="flex items-center gap-2 hover:text-text-theme transition-colors">
                        <UserCircle size={18} strokeWidth={2.5} />
                        login
                    </button>
                )}
            </div>
        </nav>
    );
};

const Footer = () => {
    const { setTheme, currentTheme } = useTheme();

    return (
        <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-sub-theme font-mono text-[10px] sm:text-xs">
            <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-0">
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <Mail size={12} /> contact
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <Heart size={12} /> support
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <Github size={12} /> github
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <span className="font-sans font-bold">discord</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors font-sans font-bold">
                    twitter
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <FileText size={12} /> terms
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <Shield size={12} /> security
                </button>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <Lock size={12} /> privacy
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Palette size={12} />
                    <select 
                      className="bg-transparent border-none outline-none cursor-pointer hover:text-text-theme transition-colors appearance-none"
                      value={currentTheme.name}
                      onChange={(e) => setTheme(e.target.value as ThemeName)}
                    >
                      {Object.keys(themes).map(name => (
                        <option key={name} value={name} className="bg-bg-theme text-text-theme">
                          {name.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                </div>
                <button className="flex items-center gap-1.5 hover:text-text-theme transition-colors">
                    <GitBranch size={12} /> v1.0.0
                </button>
            </div>
        </footer>
    );
};

export default function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <div className="min-h-[100dvh] flex flex-col bg-bg-theme text-text-theme selection:bg-main-theme/30 selection:text-main-theme font-sans">
                <CommandPalette />
                <Navbar />
                <main className="flex-1 max-w-5xl mx-auto w-full pt-8 pb-10 px-6 flex flex-col">
                    <Routes>
                        <Route path="/" element={<Practice />} />
                        <Route path="/race" element={<Race />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    </AuthProvider>
  );
}
