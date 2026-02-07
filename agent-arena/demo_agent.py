# agent-arena/demo_agent.py
"""
Demo Agent for Agent Arena v3.0 (Strategy-based)
This agent uses the new v2 API with strategy submission.
"""
import sys
import os
import time
import random
from sdk.client import ArenaClient

# Simple LLM-less strategy templates
STRATEGY_TEMPLATES = [
    """
나의 전투 전략:
1단계: 전장 환경을 면밀히 관찰하고 유리한 위치를 선점한다.
2단계: {item1}을(를) 활용해 첫 공격을 시작한다.
3단계: 상대의 반응을 보고 {item2}로 연속 공격 또는 {item3}로 방어한다.
4단계: 전장의 위험요소를 활용해 상대를 함정에 빠뜨린다.
5단계: 결정적 순간에 모든 역량을 집중해 마무리 공격을 가한다.
""",
    """
전투 계획:
- 초반: {item3}로 방어적 자세를 취하며 상대 패턴 분석
- 중반: {item1}과 {item2}를 조합한 콤보 공격으로 우위 선점  
- 후반: 전장 환경을 최대한 활용한 전략적 공격
- 피니시: 상대의 약점을 파고드는 결정타
""",
    """
승리 전략:
Phase 1: 정찰 - 전장 지형과 위험요소 파악
Phase 2: 견제 - {item1}로 상대의 움직임 제한
Phase 3: 교란 - {item3}와 {item2}를 번갈아 사용해 상대 혼란
Phase 4: 집중 - 약점이 드러난 순간 모든 공격 집중
Phase 5: 마무리 - 승기를 놓치지 않고 확실한 마무리
"""
]

def generate_strategy(agent_name: str, items: list, arena_info: dict) -> str:
    """전장 정보와 아이템을 기반으로 전략 생성"""
    template = random.choice(STRATEGY_TEMPLATES)
    
    # 아이템 랜덤 선택
    available_items = items if items else ["Punch", "Kick", "Block"]
    item1 = random.choice(available_items)
    item2 = random.choice(available_items)
    item3 = random.choice(available_items)
    
    strategy = template.format(item1=item1, item2=item2, item3=item3)
    
    # 전장 환경 추가
    arena_context = f"""
[전장 분석]
- 이름: {arena_info.get('name', '알 수 없음')}
- 환경: {arena_info.get('description', '일반적인 전투장')[:100]}...
- 위험요소: {', '.join(arena_info.get('hazards', ['없음']))}
- 특수 상황: {arena_info.get('special_condition', '없음')}

[나의 장비]
- {', '.join(items if items else ['기본 장비'])}

{strategy}
"""
    return arena_context

def main():
    print("=" * 60)
    print("  Agent Arena v3.0 - Demo Agent (Strategy Mode)")
    print("=" * 60)
    
    # 1. Initialize Client
    client = ArenaClient(base_url="http://localhost:8000")
    
    try:
        # 2. Register Two Agents
        agent_a_name = f"DemoBot_A_{random.randint(1000, 9999)}"
        agent_b_name = f"DemoBot_B_{random.randint(1000, 9999)}"
        
        print(f"\n[REGISTER] Creating agents...")
        agent_a = client.register(name=agent_a_name, description="Aggressive hacker bot", style="공격적 해커")
        agent_b = client.register(name=agent_b_name, description="Defensive mage bot", style="방어적 마법사")
        
        agent_a_id = agent_a["agent_id"]
        agent_b_id = agent_b["agent_id"]
        print(f"  → Agent A: {agent_a_name} ({agent_a_id[:8]}...)")
        print(f"  → Agent B: {agent_b_name} ({agent_b_id[:8]}...)")
        
        # 3. Start Battle (Arena auto-generated)
        print(f"\n[BATTLE] Starting battle...")
        battle_result = client.start_battle(agent_a_id, agent_b_id)
        
        battle_id = battle_result["battle_id"]
        arena = battle_result["arena"]
        
        print(f"  → Battle ID: {battle_id[:8]}...")
        print(f"\n[ARENA] 전장 생성됨!")
        print(f"  → 이름: {arena['name']}")
        print(f"  → 설명: {arena['description'][:80]}...")
        print(f"  → 위험요소: {', '.join(arena.get('hazards', []))}")
        
        # 4. Get agent inventories
        inv_a = client.get_inventory(agent_a_id)
        inv_b = client.get_inventory(agent_b_id)
        items_a = inv_a.get("deck_words", [])
        items_b = inv_b.get("deck_words", [])
        
        # 5. Generate and Submit Strategies
        print(f"\n[STRATEGY] Generating strategies...")
        
        strategy_a = generate_strategy(agent_a_name, items_a, arena)
        strategy_b = generate_strategy(agent_b_name, items_b, arena)
        
        print(f"\n  Agent A 전략 (요약):")
        print(f"  {strategy_a[:150].replace(chr(10), ' ')}...")
        
        print(f"\n  Agent B 전략 (요약):")
        print(f"  {strategy_b[:150].replace(chr(10), ' ')}...")
        
        # Submit A
        print(f"\n[SUBMIT] Agent A 전략 제출 중...")
        result_a = client.submit_strategy(battle_id, agent_a_id, strategy_a)
        print(f"  → Status: {result_a['status']}")
        
        # Submit B (this triggers simulation)
        print(f"\n[SUBMIT] Agent B 전략 제출 중...")
        result_b = client.submit_strategy(battle_id, agent_b_id, strategy_b)
        print(f"  → Status: {result_b['status']}")
        
        # 6. Show Results
        if result_b["status"] == "COMPLETED":
            battle_result = result_b["result"]
            
            print("\n" + "=" * 60)
            print("  전투 결과")
            print("=" * 60)
            
            print(f"\n  🏆 승자: {battle_result.get('winner', 'Unknown')}")
            print(f"  ❤️ 최종 HP - A: {battle_result.get('final_hp_a', '?')} / B: {battle_result.get('final_hp_b', '?')}")
            print(f"  📊 총 라운드: {battle_result.get('total_rounds', '?')}")
            
            print(f"\n  📖 전투 요약:")
            print(f"  {battle_result.get('summary', 'No summary')}")
            
            # Show narrative
            narrative = battle_result.get("narrative", [])
            if narrative:
                print(f"\n  📜 전투 내러티브:")
                for round_data in narrative[:3]:  # First 3 rounds
                    print(f"\n  [라운드 {round_data.get('round', '?')}]")
                    print(f"    A: {round_data.get('action_a', 'Unknown')[:60]}...")
                    print(f"    B: {round_data.get('action_b', 'Unknown')[:60]}...")
                    print(f"    결과: {round_data.get('result', 'Unknown')[:80]}...")
                
                if len(narrative) > 3:
                    print(f"\n  ... {len(narrative) - 3}개 라운드 더 있음")
            
            # Highlights
            highlights = battle_result.get("highlights", [])
            if highlights:
                print(f"\n  ⭐ 하이라이트:")
                for h in highlights[:2]:
                    print(f"    - {h}")
        
        print("\n" + "=" * 60)
        print("  Demo Complete!")
        print("=" * 60)
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[ERROR] {e}")

if __name__ == "__main__":
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    main()
