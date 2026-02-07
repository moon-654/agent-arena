import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_BASE = '';

const navItems = [
    { path: '/', icon: 'dashboard', label: 'DASHBOARD' },
    { path: '/battle', icon: 'swords', label: 'ARENA' },
    { path: '/market', icon: 'storefront', label: 'MARKET' },
    { path: '/community', icon: 'forum', label: 'COMMUNITY' },
    { path: '/season', icon: 'trophy', label: 'SEASON' },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [season, setSeason] = useState(null);
    const [stamina, setStamina] = useState(null);

    useEffect(() => {
        fetchSeason();
        fetchStamina();

        window.addEventListener('stamina-update', fetchStamina);
        return () => window.removeEventListener('stamina-update', fetchStamina);
    }, [location.pathname]);

    const fetchSeason = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v2/seasons/current`);
            const data = await res.json();
            setSeason(data.current_season);
        } catch (error) {
            console.error('Failed to fetch season:', error);
        }
    };

    const fetchStamina = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v2/agents/demo_agent_1/stamina`);
            const data = await res.json();
            setStamina(data);
        } catch (error) {
            console.error('Failed to fetch stamina:', error);
        }
    };

    const getTimeRemaining = () => {
        if (!season?.end_time) return null;
        const diff = new Date(season.end_time) - new Date();
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        return `${days}D : ${hours}H : ${mins}M`;
    };

    return (
        <div className="min-h-screen bg-[#181014] text-white flex flex-col">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-[#3a2730] bg-[#181014] shrink-0">
                <div className="flex items-center gap-6">
                    <NavLink to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-[#ff2e96]">
                            <span className="material-symbols-outlined text-3xl">token</span>
                        </div>
                        <h1 className="font-bold text-xl tracking-widest">
                            PROTOCOL<span className="text-[#ff2e96]">ZERO</span>
                        </h1>
                    </NavLink>
                </div>

                <div className="flex items-center gap-6">
                    {/* Season Timer */}
                    {season && getTimeRemaining() && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#ff2e96]/10 border border-[#ff2e96]/20">
                            <span className="text-xs font-bold text-[#ff2e96] tracking-wider">
                                {season.name || 'SEASON 1'} ENDS IN:
                            </span>
                            <span className="font-mono text-sm font-bold">
                                {getTimeRemaining()}
                            </span>
                        </div>
                    )}

                    {/* Stamina Bar */}
                    {stamina && (
                        <div className="flex flex-col w-32 mr-2 group relative">
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                                <span className="text-[#ff2e96] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">bolt</span>
                                    STAMINA
                                </span>
                                <span className="text-white">{stamina.current}/{stamina.max}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#281b21] rounded-full overflow-hidden border border-[#3a2730]">
                                <div
                                    className="h-full bg-gradient-to-r from-[#ff2e96] to-[#ff0055] transition-all duration-500"
                                    style={{ width: `${(stamina.current / stamina.max) * 100}%` }}
                                ></div>
                            </div>

                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#181014] border border-[#3a2730] p-2 rounded text-[10px] text-[#bc9aab] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                                Cost: {stamina.cost_per_battle} / Battle<br />
                                Refills daily at 00:00 UTC
                            </div>
                        </div>
                    )}

                    {/* System Status */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-xs font-medium text-[#bc9aab]">SYSTEM ONLINE</span>
                    </div>

                    {/* Quick Battle Button */}
                    <NavLink
                        to="/battle"
                        className="px-4 py-2 bg-[#ff2e96] hover:bg-pink-600 text-white text-sm font-bold rounded flex items-center gap-2 transition-colors"
                    >
                        ⚔️ QUICK BATTLE
                    </NavLink>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-[#181014] border-r border-[#3a2730] flex flex-col py-6 shrink-0">
                    <nav className="flex flex-col gap-2 px-3 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-[#ff2e96]/10 text-[#ff2e96] border-l-2 border-[#ff2e96]'
                                        : 'text-[#bc9aab] hover:text-white hover:bg-[#281b21]'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Settings & Disconnect */}
                    <div className="px-3 border-t border-[#3a2730] pt-4 mt-4">
                        <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#bc9aab] hover:text-white hover:bg-[#281b21]">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-medium tracking-wide">SETTINGS</span>
                        </a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
