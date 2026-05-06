import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../firebase/AuthContext';
import { TypingArea } from '../components/TypingArea';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Trophy, AlertTriangle, Loader2, Quote, Type, Clock } from 'lucide-react';
import { saveRaceStats } from '../lib/firebaseUtils';
import { cn } from '../lib/utils';

interface Player {
    id: string;
    displayName: string;
    progress: number;
    wpm: number;
}

interface Room {
    id: string;
    status: 'waiting' | 'playing' | 'finished';
    text: string;
    players: Record<string, Player>;
    type: 'words' | 'quotes';
}

export const Race: React.FC = () => {
    const { user, userData } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [lobbyTimer, setLobbyTimer] = useState<number | null>(null);
    
    // Auto disconnect when leaving
    useEffect(() => {
        if (!user) return;

        const newSocket = io(window.location.origin);
        setSocket(newSocket);

        newSocket.on("room_update", (updatedRoom: Room) => {
            setRoom(updatedRoom);
            setIsSearching(false);
        });

        newSocket.on("race_started", ({ startTime }) => {
            const timeToStart = startTime - Date.now();
            setLobbyTimer(null);
            
            if (timeToStart > 0) {
                 setCountdown(Math.ceil(timeToStart / 1000));
                 const intId = setInterval(() => {
                     setCountdown(prev => {
                         if (prev === null || prev <= 1) {
                             clearInterval(intId);
                             setIsStarted(true);
                             return null;
                         }
                         return prev - 1;
                     });
                 }, 1000);
            } else {
                 setIsStarted(true);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // 6-second auto-start logic
    useEffect(() => {
        if (room && room.status === 'waiting' && lobbyTimer === null) {
            setLobbyTimer(6);
        }
    }, [room]);

    useEffect(() => {
        if (lobbyTimer !== null && lobbyTimer > 0 && room?.status === 'waiting') {
            const id = setTimeout(() => setLobbyTimer(lobbyTimer - 1), 1000);
            return () => clearTimeout(id);
        } else if (lobbyTimer === 0 && room?.status === 'waiting') {
            handleStart();
        }
    }, [lobbyTimer, room]);

    const handleJoinMatch = (type: 'words' | 'quotes') => {
        if (socket && user) {
            setIsSearching(true);
            socket.emit("join_match", { 
                type,
                user: { displayName: userData?.displayName || user?.displayName || "Guest" } 
            });
        }
    };

    const handleStart = () => {
        if (socket && room && room.status === 'waiting') {
            socket.emit("start_race", { roomId: room.id });
        }
    };

    const lastEmitRef = useRef<number>(0);

    const handleProgress = (progress: number, wpm: number) => {
        const now = Date.now();
        if (socket && room && isStarted && (now - lastEmitRef.current > 100 || progress === 1)) {
            socket.emit("update_progress", { roomId: room.id, progress, wpm });
            lastEmitRef.current = now;
        }
    };

    const handleFinish = async (wpm: number, accuracy: number) => {
        await saveRaceStats(wpm, accuracy, 'race');
    };

    if (!user) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[50vh] text-sub-theme">
                 <AlertTriangle size={48} className="text-main-theme mb-4" />
                 <p>You must be logged in to participate in races.</p>
             </div>
         );
    }

    if (!room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4">
                <Trophy size={64} className="text-main-theme mb-6 opacity-80" />
                <h2 className="text-3xl font-bold text-text-theme mb-2 uppercase tracking-tight">Multiplayer Racing</h2>
                <p className="text-sub-theme mb-12 text-center opacity-60">Compete against other typists in the community</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <button 
                        onClick={() => handleJoinMatch('words')}
                        disabled={isSearching}
                        className={cn(
                            "group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:translate-y-[-4px]",
                            "bg-bg-theme border-sub-theme/10 hover:border-main-theme/50 hover:bg-sub-theme/5",
                            isSearching && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="p-4 bg-main-theme/10 rounded-full group-hover:scale-110 transition-transform">
                            <Type size={32} className="text-main-theme" />
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-xl text-text-theme">Join a Race</span>
                            <span className="text-xs text-sub-theme font-mono uppercase tracking-widest">Random Words</span>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleJoinMatch('quotes')}
                        disabled={isSearching}
                        className={cn(
                            "group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all hover:translate-y-[-4px]",
                            "bg-bg-theme border-sub-theme/10 hover:border-main-theme/50 hover:bg-sub-theme/5",
                            isSearching && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="p-4 bg-main-theme/10 rounded-full group-hover:scale-110 transition-transform">
                            <Quote size={32} className="text-main-theme" />
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-xl text-text-theme">Quote Race</span>
                            <span className="text-xs text-sub-theme font-mono uppercase tracking-widest">Famous Sentences</span>
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {isSearching && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 flex items-center gap-3 text-main-theme font-mono text-sm"
                        >
                            <Loader2 className="animate-spin" size={16} />
                            Finding competitive room...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <div className="text-[10px] font-mono text-sub-theme uppercase tracking-widest mb-1 opacity-50">Room Context</div>
                    <h2 className="text-xl font-mono text-sub-theme lowercase flex items-center gap-3">
                        <span className="text-main-theme font-bold">{room.id}</span>
                        <span className="text-xs bg-sub-theme/10 px-2 py-0.5 rounded opacity-60">{room.type}</span>
                    </h2>
                </div>
                
                <AnimatePresence>
                    {room.status === "waiting" && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex items-center gap-2 text-sub-theme font-mono text-sm">
                                <Clock size={16} />
                                {lobbyTimer}s
                            </div>
                            <button 
                                onClick={handleStart} 
                                className="bg-main-theme hover:brightness-110 text-bg-theme font-bold px-6 py-2 rounded-lg transition-all text-sm uppercase tracking-wider shadow-lg shadow-main-theme/20"
                            >
                                Start Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Players Area */}
            <div className="space-y-8 mb-16 px-2">
                {Object.values(room.players).map((player: Player) => (
                    <div key={player.id} className="relative">
                        <div className="flex justify-between text-[11px] font-mono mb-2 text-sub-theme">
                            <span className={cn(
                                player.id === socket?.id ? "text-main-theme font-bold" : "opacity-60"
                            )}>
                                {player.displayName} {player.id === socket?.id && "(You)"}
                            </span>
                            <span className="opacity-40">{player.wpm} wpm</span>
                        </div>
                        <div className="h-2 bg-sub-theme/10 rounded-full overflow-visible relative">
                            <motion.div 
                                className="h-full bg-main-theme/30 relative rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min(player.progress * 100, 100)}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                            <motion.div 
                                className="absolute top-1/2 -translate-y-1/2"
                                animate={{ left: `calc(${Math.min(player.progress * 100, 100)}% - 10px)` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            >
                                <Car size={18} className={cn(
                                    "drop-shadow-md",
                                    player.id === socket?.id ? "text-main-theme scale-125" : "text-sub-theme opacity-30"
                                )} />
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>

            {countdown !== null && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-theme/80 backdrop-blur-sm">
                     <motion.div 
                         key={countdown}
                         initial={{ scale: 0.5, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 1.5, opacity: 0 }}
                         className="text-9xl font-bold font-mono text-main-theme"
                     >
                         {countdown}
                     </motion.div>
                 </div>
            )}

            {isStarted ? (
                <TypingArea 
                    text={room.text} 
                    onProgress={handleProgress}
                    onFinish={handleFinish}
                />
            ) : (
                <div className="text-center font-mono text-sub-theme italic animate-pulse opacity-40 text-sm py-20">
                    {room.status === "waiting" 
                        ? `Waiting for competitors to synchronize... (${lobbyTimer}s)` 
                        : "Preparing race track..."}
                </div>
            )}
        </div>
    );
};
