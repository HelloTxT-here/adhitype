import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { getUserHistory, Score } from '../lib/firebaseUtils';
import { motion } from 'motion/react';
import { Trophy, Clock, Target, Calendar, User, History, ChevronRight, LayoutGrid, Info, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { useTheme, themes } from '../context/ThemeContext';

export const Profile: React.FC = () => {
    const { user, userData } = useAuth();
    const { currentTheme } = useTheme();
    const [history, setHistory] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getUserHistory(user.uid).then(data => {
                setHistory(data);
                setLoading(false);
            });
        }
    }, [user]);

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-sub-theme">
            <Info size={48} className="mb-4 opacity-50" />
            <p>Please log in to view your profile analytics.</p>
        </div>
    );

    const averageWpm = history.length > 0 
        ? Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length) 
        : 0;

    const maxWpm = history.length > 0
        ? Math.max(...history.map(s => s.wpm))
        : 0;

    const consistency = history.length > 1
        ? Math.round(100 - (history.reduce((acc, curr, idx, arr) => {
            if (idx === 0) return acc;
            return acc + Math.abs(curr.wpm - arr[idx-1].wpm);
          }, 0) / (history.length - 1) / (averageWpm || 1)) * 100)
        : 100;

    const estimatedRank = averageWpm > 120 ? 'Master' : averageWpm > 100 ? 'Diamond' : averageWpm > 80 ? 'Gold' : averageWpm > 50 ? 'Silver' : 'Bronze';

    const chartData = [...history].reverse().map((s, i) => ({
        index: i + 1,
        wpm: s.wpm,
        acc: s.accuracy,
        date: s.createdAt?.toDate ? format(s.createdAt.toDate(), 'MMM d') : ''
    }));

    const timeTypingMinutes = Math.round(userData?.timeTyping || 0);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-12">
            {/* Header / User Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <div className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-bg-theme border border-sub-theme/10 rounded-2xl">
                    <div className="w-24 h-24 rounded-full bg-main-theme/10 flex items-center justify-center mb-4 border-2 border-main-theme/20">
                        <User size={48} className="text-main-theme" />
                    </div>
                    <h1 className="text-xl font-bold text-text-theme uppercase tracking-wider">{userData?.displayName || user.displayName}</h1>
                    <p className="text-xs text-sub-theme font-mono opacity-50 mt-1">Joined {user.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMM yyyy') : 'Recently'}</p>
                </div>

                <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        label="estimated rank" 
                        value={estimatedRank} 
                        icon={<Trophy size={20} />} 
                        highlight
                    />
                    <StatCard 
                        label="max speed" 
                        value={`${maxWpm} wpm`} 
                        icon={<Trophy size={20} />} 
                    />
                    <StatCard 
                        label="consistency" 
                        value={`${Math.max(0, Math.min(100, consistency))}%`} 
                        icon={<Target size={20} />} 
                    />
                    <StatCard 
                        label="time typing" 
                        value={`${timeTypingMinutes}m`} 
                        icon={<Clock size={20} />} 
                    />
                </div>
            </motion.div>

            {/* Progress Chart */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-bg-theme border border-sub-theme/10 rounded-2xl p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-sub-theme">progress overview</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={themes[currentTheme.name].main} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={themes[currentTheme.name].main} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.sub} opacity={0.1} vertical={false} />
                            <XAxis 
                                dataKey="index" 
                                stroke={currentTheme.sub} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke={currentTheme.sub} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                domain={['dataMin - 10', 'dataMax + 10']}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: currentTheme.bg, 
                                    borderColor: currentTheme.sub + '20',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: currentTheme.main }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="wpm" 
                                stroke={currentTheme.main} 
                                fillOpacity={1} 
                                fill="url(#colorWpm)" 
                                strokeWidth={3}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.section>

            {/* History Table */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
            >
                <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-sub-theme px-2">recent matches</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] text-sub-theme uppercase tracking-widest opacity-40">
                                <th className="px-6 py-2">wpm</th>
                                <th className="px-6 py-2">accuracy</th>
                                <th className="px-6 py-2">mode</th>
                                <th className="px-6 py-2 text-right">date</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {history.map((s, i) => (
                                <tr key={s.id} className="group bg-bg-theme hover:bg-sub-theme/5 border border-sub-theme/10 transition-colors">
                                    <td className="px-6 py-4 rounded-l-xl text-lg font-bold text-main-theme">
                                        {s.wpm}
                                    </td>
                                    <td className="px-6 py-4 text-text-theme opacity-80">
                                        {s.accuracy}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] bg-sub-theme/10 text-sub-theme px-2 py-0.5 rounded-full uppercase">
                                            {s.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 rounded-r-xl text-right text-xs text-sub-theme opacity-50">
                                        {s.createdAt?.toDate ? formatDistanceToNow(s.createdAt.toDate(), { addSuffix: true }) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </div>
    );
};

const StatCard = ({ label, value, icon, highlight }: { label: string, value: string | number, icon: React.ReactNode, highlight?: boolean }) => (
    <div className={cn(
        "flex flex-col p-6 border rounded-2xl transition-all hover:scale-[1.02]",
        highlight 
            ? "bg-main-theme/5 border-main-theme/20 shadow-lg shadow-main-theme/5" 
            : "bg-bg-theme border-sub-theme/10"
    )}>
        <div className="flex items-center justify-between mb-4 text-sub-theme opacity-50">
            {icon}
            <ChevronRight size={14} />
        </div>
        <div className={cn("text-3xl font-bold font-mono tracking-tight", highlight ? "text-main-theme" : "text-text-theme")}>
            {value}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-sub-theme mt-1 opacity-60">
            {label}
        </div>
    </div>
);
