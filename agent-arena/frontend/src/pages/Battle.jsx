import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Battle() {
    const [battles, setBattles] = useState([]);
    const [selectedBattle, setSelectedBattle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'live'

    useEffect(() => {
        fetchBattles();
    }, []);

    const fetchBattles = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/battles`);
            const data = await res.json();
            setBattles(data.battles || []);
            if (data.battles?.length > 0) {
                setSelectedBattle(data.battles[0]);
            }
        } catch (error) {
            console.error('Failed to fetch battles:', error);
        } finally {
            setLoading(false);
        }
    };

    const startBattle = async (mode = 'ranked') => {
        try {
            const res = await fetch(`${API_BASE}/api/v2/battle/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_a_id: 'demo_agent_1',
                    agent_b_id: 'demo_agent_2',
                    mode: mode
                })
            });
            const data = await res.json();

            if (res.ok) {
                await autoSubmitStrategies(data.battle_id);
                window.dispatchEvent(new Event('stamina-update'));
                fetchBattles();
            } else {
                alert(`Cannot start battle: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to start battle:', error);
            alert('Failed to start battle');
        }
    };

    const autoSubmitStrategies = async (battleId) => {
        const strategies = [
            { agent_id: 'demo_agent_1', strategy: "Attack aggressively with all items." },
            { agent_id: 'demo_agent_2', strategy: "Defend and counter-attack." }
        ];

        for (const s of strategies) {
            await fetch(`${API_BASE}/api/v2/battle/${battleId}/strategy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(s)
            });
        }
    };

    return (
        <div className="flex h-full">
            {/* Battle History Sidebar */}
            <aside className="w-72 border-r border-[#3a2730] flex flex-col bg-[#181014]">
                <div className="p-4 border-b border-[#3a2730]">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#ff2e96]">history</span>
                        BATTLE HISTORY
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${filter === 'all' ? 'bg-[#ff2e96] text-white' : 'bg-[#281b21] text-[#bc9aab] hover:bg-[#3a2730]'}`}
                        >ALL</button>
                        <button
                            onClick={() => setFilter('live')}
                            className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${filter === 'live' ? 'bg-[#ff2e96] text-white' : 'bg-[#281b21] text-[#bc9aab] hover:bg-[#3a2730]'}`}
                        >LIVE</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <div className="text-center py-8 text-[#bc9aab]">Loading...</div>
                    ) : battles.length === 0 ? (
                        <div className="text-center py-8 text-[#bc9aab]">No battles yet</div>
                    ) : (
                        battles.filter(b => filter === 'all' || b.status === 'in_progress').map((battle) => (
                            <button
                                key={battle.id}
                                onClick={() => setSelectedBattle(battle)}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedBattle?.id === battle.id
                                    ? 'bg-[#ff2e96]/10 border-[#ff2e96]/50'
                                    : 'bg-[#281b21] border-[#3a2730] hover:border-[#ff2e96]/30'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${battle.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                        battle.status === 'in_progress' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {battle.status?.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-[#bc9aab]">{battle.arena}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>{battle.agent_a_id?.slice(0, 8)}</span>
                                    <span className="text-[#ff2e96]">VS</span>
                                    <span>{battle.agent_b_id?.slice(0, 8)}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Battle View */}
            <main className="flex-1 flex flex-col">
                {/* Battle Header */}
                <header className="h-14 flex items-center justify-between px-6 border-b border-[#3a2730]">
                    <span className="text-[#bc9aab]">BATTLE ARENA</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => startBattle('practice')}
                            className="px-4 py-2 bg-[#281b21] hover:bg-[#3a2730] text-[#bc9aab] text-sm font-bold rounded flex items-center gap-2 border border-[#3a2730]"
                        >
                            <span className="material-symbols-outlined text-lg">fitness_center</span>
                            PRACTICE
                        </button>
                        <button
                            onClick={() => startBattle('ranked')}
                            className="px-4 py-2 bg-[#ff2e96] hover:bg-pink-600 text-white text-sm font-bold rounded flex items-center gap-2"
                        >
                            ⚔️ RANKED
                        </button>
                    </div>
                </header>

                {/* Battle Display */}
                <div className="flex-1 flex items-center justify-center p-8">
                    {selectedBattle ? (
                        <div className="w-full max-w-3xl">
                            {/* Arena Header */}
                            <div className="text-center mb-8">
                                <span className="px-4 py-1 bg-[#281b21] text-[#bc9aab] rounded-full text-sm border border-[#3a2730]">
                                    {selectedBattle.arena || 'NEON CITY ARENA'}
                                </span>
                            </div>

                            {/* VS Display */}
                            <div className="flex items-center justify-between gap-8">
                                {/* Agent A */}
                                <div className="flex-1 text-center">
                                    <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[#00d4ff]/20 to-[#00d4ff]/5 rounded-xl border-2 border-[#00d4ff]/50 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-5xl text-[#00d4ff]">smart_toy</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{selectedBattle.agent_a_id?.slice(0, 12)}</h3>
                                    <span className="px-2 py-1 bg-[#00d4ff]/20 text-[#00d4ff] text-xs rounded">ATTACKER</span>
                                </div>

                                {/* VS */}
                                <div className="text-5xl font-black text-white/10">VS</div>

                                {/* Agent B */}
                                <div className="flex-1 text-center">
                                    <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[#ff2e96]/20 to-[#ff2e96]/5 rounded-xl border-2 border-[#ff2e96]/50 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-5xl text-[#ff2e96]">smart_toy</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{selectedBattle.agent_b_id?.slice(0, 12)}</h3>
                                    <span className="px-2 py-1 bg-[#ff2e96]/20 text-[#ff2e96] text-xs rounded">DEFENDER</span>
                                </div>
                            </div>

                            {/* Battle Result */}
                            {selectedBattle.status === 'completed' && (
                                <div className="text-center mt-8 p-6 bg-[#281b21] rounded-xl border border-[#3a2730]">
                                    <span className="text-sm text-[#bc9aab]">WINNER</span>
                                    <h2 className="text-2xl font-bold text-[#ff2e96] mt-2">
                                        {selectedBattle.winner?.slice(0, 15)}
                                    </h2>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className="material-symbols-outlined text-8xl text-[#3a2730] mb-8">swords</span>
                            <h2 className="text-2xl font-bold mb-8">CHOOSE BATTLE MODE</h2>

                            <div className="flex justify-center gap-8">
                                {/* Shadow Boxing */}
                                <div className="bg-[#1f1419] p-6 rounded-xl border border-[#3a2730] hover:border-[#bc9aab] transition-all hover:-translate-y-1 w-64 text-center group cursor-pointer"
                                    onClick={() => startBattle('practice')}>
                                    <div className="w-16 h-16 mx-auto bg-[#281b21] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#bc9aab]/20 transition-colors">
                                        <span className="material-symbols-outlined text-3xl text-[#bc9aab]">fitness_center</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">SHADOW BOXING</h3>
                                    <p className="text-xs text-[#bc9aab] mb-4">Practice Mode against AI</p>
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#281b21] rounded text-xs font-bold text-[#bc9aab]">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span> 2
                                    </div>
                                </div>

                                {/* Ranked Match */}
                                <div className="bg-[#1f1419] p-6 rounded-xl border border-[#3a2730] hover:border-[#ff2e96] hover:shadow-[0_0_20px_rgba(255,46,150,0.2)] transition-all hover:-translate-y-1 w-64 text-center group cursor-pointer relative overflow-hidden"
                                    onClick={() => startBattle('ranked')}>
                                    <div className="absolute top-0 right-0 p-2 opacity-20">
                                        <span className="material-symbols-outlined text-[#ff2e96] text-8xl rotate-12 translate-x-4 -translate-y-4">trophy</span>
                                    </div>
                                    <div className="w-16 h-16 mx-auto bg-[#ff2e96]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#ff2e96]/20 transition-colors relative z-10">
                                        <span className="material-symbols-outlined text-3xl text-[#ff2e96]">swords</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 relative z-10">ARENA MATCH</h3>
                                    <p className="text-xs text-[#ff2e96] mb-4 relative z-10">Ranked Battle for Glory</p>
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff2e96] rounded text-xs font-bold text-white relative z-10">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span> 10
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
