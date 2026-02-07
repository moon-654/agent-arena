import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Season() {
    const [currentSeason, setCurrentSeason] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (currentSeason?.end_time) {
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [currentSeason]);

    const fetchData = async () => {
        try {
            const [seasonRes, leaderboardRes] = await Promise.all([
                fetch(`${API_BASE}/api/v2/seasons/current`),
                fetch(`${API_BASE}/api/v2/leaderboard`)
            ]);

            const seasonData = await seasonRes.json();
            const leaderboardData = await leaderboardRes.json();

            setCurrentSeason(seasonData.current_season);
            setLeaderboard(leaderboardData.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTimer = () => {
        if (currentSeason?.end_time) {
            const end = new Date(currentSeason.end_time);
            const now = new Date();
            const diff = end - now;

            if (diff > 0) {
                setTimeRemaining({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((diff / (1000 * 60)) % 60),
                    secs: Math.floor((diff / 1000) % 60)
                });
            }
        }
    };

    const rewards = [
        { tier: 15, name: 'Cyber-Katana', type: 'Weapon Skin' },
        { tier: 20, name: '5000 Credits', type: 'Currency' },
        { tier: 50, name: 'Legendary Core', type: 'Upgrade' }
    ];

    return (
        <div className="p-8">
            {/* Hero Banner */}
            <section className="relative py-16 text-center bg-gradient-to-b from-[#281b21] to-transparent rounded-2xl mb-8">
                <span className="inline-block px-4 py-1 bg-[#ff2e96] text-white text-sm font-bold rounded-full mb-4">
                    ● SEASON LIVE
                </span>
                <h1 className="text-5xl font-black mb-4">PROTOCOL ZERO</h1>
                <p className="text-[#ff2e96] mb-8">SECURE YOUR RANK IN THE NEURAL NETWORK</p>

                {/* Countdown */}
                <div className="flex justify-center gap-4 mb-8">
                    {[
                        { value: timeRemaining.days, label: 'DAYS' },
                        { value: timeRemaining.hours, label: 'HOURS' },
                        { value: timeRemaining.mins, label: 'MINS' },
                        { value: timeRemaining.secs, label: 'SECS', highlight: true }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`px-6 py-4 rounded-lg border ${item.highlight
                                ? 'bg-[#ff2e96]/20 border-[#ff2e96]/50'
                                : 'bg-[#281b21] border-[#3a2730]'
                                }`}
                        >
                            <div className={`text-3xl font-bold ${item.highlight ? 'text-[#ff2e96]' : ''}`}>
                                {String(item.value).padStart(2, '0')}
                            </div>
                            <div className={`text-xs ${item.highlight ? 'text-[#ff2e96]' : 'text-[#bc9aab]'}`}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>

                <a href="/battle" className="inline-block px-8 py-3 bg-[#ff2e96] hover:bg-pink-600 text-white font-bold rounded">
                    ⚔️ ENTER ARENA
                </a>
            </section>

            <div className="grid grid-cols-3 gap-8">
                {/* Leaderboard */}
                <div className="col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        🏆 ELITE LEADERBOARD
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-[#bc9aab]">Loading...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-[#bc9aab]">No rankings yet</div>
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.slice(0, 10).map((entry, index) => (
                                <div
                                    key={entry.agent_id}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${index < 3
                                        ? 'bg-[#281b21] border-[#ff2e96]/30'
                                        : 'bg-[#1f1419] border-[#3a2730]'
                                        }`}
                                >
                                    <span className={`w-8 text-center font-bold text-xl ${index === 0 ? 'text-yellow-500' :
                                        index === 1 ? 'text-gray-400' :
                                            index === 2 ? 'text-orange-700' : 'text-[#bc9aab]'
                                        }`}>
                                        #{index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded bg-[#3a2730] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#bc9aab]">smart_toy</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold">{entry.agent_id.slice(0, 15)}</div>
                                    </div>
                                    <div className="font-mono text-[#00d4ff] font-bold">{entry.elo}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Season Rewards */}
                <div className="col-span-1">
                    <div className="bg-[#1f1419] rounded-xl border border-[#3a2730] p-4">
                        <h3 className="font-bold mb-4">🎁 SEASON REWARDS</h3>

                        <div className="space-y-3">
                            {rewards.map((reward) => (
                                <div key={reward.tier} className="flex items-center gap-3 p-3 bg-[#281b21] rounded-lg border border-[#3a2730]">
                                    <div className="w-10 h-10 rounded bg-[#ff2e96]/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#ff2e96]">star</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">Tier {reward.tier}: {reward.name}</div>
                                        <div className="text-xs text-[#00d4ff]">{reward.type}</div>
                                    </div>
                                    <span className="material-symbols-outlined text-[#bc9aab]">lock</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
