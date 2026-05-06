import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardEntry {
    id: string;
    displayName: string;
    wpmRecord: number;
    gamesPlayed: number;
}

export const Leaderboard: React.FC = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('wpmRecord', 'desc'), limit(50));
                const snapshot = await getDocs(q);
                const data: LeaderboardEntry[] = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
                });
                setEntries(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-main-theme" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col items-center gap-2 mb-16">
                <Trophy size={48} className="text-main-theme opacity-80" />
                <h1 className="text-4xl font-bold font-sans tracking-tight text-text-theme uppercase">Leaderboard</h1>
                <p className="text-sub-theme font-mono text-xs opacity-60">all-time high scores</p>
            </div>

            <div className="bg-bg-theme rounded-2xl border border-sub-theme/10 overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-sub-theme/10 text-[10px] font-mono tracking-[0.2em] text-sub-theme opacity-40 uppercase">
                    <div className="col-span-2 text-center">rank</div>
                    <div className="col-span-6 ml-4">typist</div>
                    <div className="col-span-2 text-right">wpm</div>
                    <div className="col-span-2 text-right">races</div>
                </div>

                <div className="divide-y divide-sub-theme/5">
                    {entries.map((entry, index) => (
                        <motion.div 
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-sub-theme/5 transition-colors group"
                        >
                            <div className="col-span-2 flex justify-center">
                                {index === 0 ? <Medal className="text-main-theme scale-125" /> :
                                 index === 1 ? <Medal className="text-text-theme opacity-70" /> :
                                 index === 2 ? <Medal className="text-amber-700/70" /> :
                                 <span className="font-mono text-xs text-sub-theme opacity-50">{index + 1}</span>}
                            </div>
                            <div className="col-span-6 font-medium text-lg ml-4 text-text-theme/90">
                                {entry.displayName}
                                {index === 0 && <span className="ml-2 text-[10px] bg-main-theme/10 text-main-theme px-1.5 py-0.5 rounded-full font-mono uppercase">god complex</span>}
                            </div>
                            <div className="col-span-2 text-right font-mono text-xl text-main-theme font-bold">
                                {entry.wpmRecord}
                            </div>
                            <div className="col-span-2 text-right font-mono text-sm text-sub-theme opacity-60">
                                {entry.gamesPlayed}
                            </div>
                        </motion.div>
                    ))}

                    {entries.length === 0 && (
                        <div className="p-12 text-center text-sub-theme italic font-mono text-sm opacity-50">
                            No entries yet. Be the first to race!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
