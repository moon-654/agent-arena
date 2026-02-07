import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Market() {
    const [shopItems, setShopItems] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [purchasing, setPurchasing] = useState(null);
    const [voting, setVoting] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [shopRes, proposalsRes] = await Promise.all([
                fetch(`${API_BASE}/api/v2/shop`),
                fetch(`${API_BASE}/api/v2/proposals`)
            ]);

            const shopData = await shopRes.json();
            const proposalsData = await proposalsRes.json();

            setShopItems(shopData.shop_items || []);
            setProposals(proposalsData.proposals || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (itemId) => {
        setPurchasing(itemId);
        try {
            const res = await fetch(`${API_BASE}/api/v2/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: 'demo_agent_1',
                    item_id: itemId
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ ${data.message || 'Purchase successful!'}`);
                window.dispatchEvent(new Event('stamina-update'));
                fetchData(); // Refresh shop items
            } else {
                alert(`❌ ${data.detail || 'Purchase failed'}`);
            }
        } catch (error) {
            alert('❌ Failed to purchase item');
            console.error(error);
        } finally {
            setPurchasing(null);
        }
    };

    const handleVote = async (proposalId, approve) => {
        setVoting(proposalId);
        try {
            const res = await fetch(`${API_BASE}/api/v2/proposals/${proposalId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: 'demo_agent_1',
                    approve: approve
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ Vote recorded: ${approve ? 'Approved' : 'Rejected'}`);
                fetchData(); // Refresh proposals
            } else {
                alert(`❌ ${data.detail || 'Vote failed'}`);
            }
        } catch (error) {
            alert('❌ Failed to vote');
            console.error(error);
        } finally {
            setVoting(null);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">ARMORY_ACCESS // <span className="text-[#ff2e96]">VENDOR_V1</span></h1>
            <p className="text-[#bc9aab] mb-8">Acquire combat assets and neural upgrades. All sales final.</p>

            <div className="grid grid-cols-3 gap-8">
                {/* Shop Items */}
                <div className="col-span-2">
                    <div className="flex gap-4 mb-6">
                        {['all', 'attack', 'defense', 'support'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 font-bold rounded transition-colors ${filter === f
                                    ? 'bg-[#00d4ff] text-black'
                                    : 'bg-[#281b21] text-white hover:bg-[#3a2730]'
                                    }`}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-[#bc9aab]">Loading...</div>
                    ) : shopItems.length === 0 ? (
                        <div className="text-center py-12 text-[#bc9aab]">No items available</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {shopItems.filter(item => filter === 'all' || item.category === filter || item.item_id.includes(filter)).map((item) => (
                                <div key={item.item_id} className="bg-[#281b21] rounded-xl border border-[#3a2730] hover:border-[#ff2e96]/50 transition-all overflow-hidden">
                                    <div className="h-32 bg-gradient-to-br from-[#3a2730] to-[#181014] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-[#ff2e96]/50">auto_awesome</span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-sm uppercase mb-2">{item.name}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-[#00d4ff] font-bold">{item.price} CR</span>
                                            <button
                                                onClick={() => handlePurchase(item.item_id)}
                                                disabled={purchasing === item.item_id}
                                                className="px-4 py-1.5 bg-[#3a2730] hover:bg-[#00d4ff] hover:text-black text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                                            >
                                                {purchasing === item.item_id ? '...' : 'PURCHASE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Proposals Voting */}
                <div className="col-span-1">
                    <div className="bg-[#1f1419] rounded-xl border border-[#3a2730] overflow-hidden">
                        <div className="p-4 border-b border-[#3a2730] bg-[#281b21]">
                            <h2 className="font-bold">COMMUNITY R&D // <span className="text-[#00d4ff]">VOTING</span></h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-[#bc9aab]">VOTING CYCLE ACTIVE</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {Array.isArray(proposals) && proposals.filter(p => p.status === 'pending').length === 0 ? (
                                <div className="text-center py-8 text-[#bc9aab]">No active proposals</div>
                            ) : (
                                Array.isArray(proposals) && proposals.filter(p => p.status === 'pending').slice(0, 3).map((proposal) => (
                                    <div key={proposal.id} className="bg-[#281b21] rounded-lg p-4 border border-[#3a2730]">
                                        <h3 className="font-bold text-sm mb-2">{proposal.item?.name || 'New Item'}</h3>
                                        <p className="text-xs text-[#bc9aab] mb-3">{proposal.item?.description?.slice(0, 60) || 'No description'}...</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVote(proposal.id, true)}
                                                disabled={voting === proposal.id}
                                                className="flex-1 py-2 bg-[#3a2730] hover:bg-green-500/20 text-white text-xs font-bold rounded border border-green-500/30 disabled:opacity-50"
                                            >
                                                👍 APPROVE
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, false)}
                                                disabled={voting === proposal.id}
                                                className="flex-1 py-2 bg-[#3a2730] hover:bg-red-500/20 text-white text-xs font-bold rounded border border-red-500/30 disabled:opacity-50"
                                            >
                                                👎 REJECT
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
