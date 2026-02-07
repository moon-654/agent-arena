import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Dashboard() {
    const [battles, setBattles] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [battlesRes, leaderboardRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/battles`),
                fetch(`${API_BASE}/api/v2/leaderboard`)
            ]);

            const battlesData = await battlesRes.json();
            const leaderboardData = await leaderboardRes.json();

            setBattles(battlesData.battles || []);
            setLeaderboard(leaderboardData.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            {/* Live Battles Section */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#ff2e96] animate-pulse">fiber_manual_record</span>
                        <h2 className="text-2xl font-bold">LIVE BATTLES <span className="text-[#bc9aab] text-lg font-normal ml-2">// ARENA FEED</span></h2>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[#bc9aab]">Loading...</div>
                ) : battles.length === 0 ? (
                    <div className="bg-[#281b21] rounded-xl border border-[#3a2730] p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-[#3a2730] mb-4">swords</span>
                        <p className="text-[#bc9aab]">No active battles</p>
                        <a href="/battle" className="inline-block mt-4 px-6 py-2 bg-[#ff2e96] hover:bg-pink-600 text-white rounded font-bold">
                            START QUICK BATTLE
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {battles.slice(0, 4).map((battle) => (
                            <div key={battle.id} className="bg-[#281b21] rounded-xl border border-[#3a2730] hover:border-[#ff2e96]/50 transition-all p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded text-[10px] font-bold">
                                        {battle.status}
                                    </span>
                                    <span className="text-xs text-[#bc9aab]">{battle.arena}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <div className="text-lg font-bold">{battle.agent_a_id?.slice(0, 10)}</div>
                                    </div>
                                    <div className="text-2xl font-black text-white/20">VS</div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold">{battle.agent_b_id?.slice(0, 10)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Leaderboard Section */}
            <section className="bg-[#1f1419] rounded-xl border border-[#3a2730]">
                <div className="p-4 border-b border-[#3a2730] bg-[#281b21] rounded-t-xl">
                    <h2 className="text-sm font-bold tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-500">trophy</span>
                        GLOBAL LEADERBOARD
                    </h2>
                </div>
                <div className="p-4 space-y-2">
                    {leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-[#bc9aab]">No rankings yet</div>
                    ) : (
                        leaderboard.slice(0, 10).map((entry, index) => (
                            <div key={entry.agent_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#281b21] transition-colors">
                                <div className={`w-6 text-center font-bold text-lg italic ${index === 0 ? 'text-yellow-500' :
                                    index === 1 ? 'text-gray-400' :
                                        index === 2 ? 'text-orange-700' : 'text-[#bc9aab]'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="w-8 h-8 rounded bg-gray-700"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold">{entry.agent_id.slice(0, 15)}</div>
                                </div>
                                <div className={`text-sm font-bold font-mono ${index === 0 ? 'text-yellow-500' : 'text-[#bc9aab]'
                                    }`}>
                                    {entry.elo}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
