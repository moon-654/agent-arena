import os
import time
import json
import random
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

# Try to import OpenAI, but handle if not installed
try:
    from openai import AsyncOpenAI
except ImportError:
    print("Error: 'openai' package not found. Please run: pip install openai")
    exit(1)

# Load environment variables
load_dotenv()

# --- Configuration ---
# API_KEY = os.getenv("OPENAI_API_KEY")
API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = "gpt-4o-mini"  # Cost-effective model
MAX_TURNS = 5  # Short match for PoC
TICK_INTERVAL = 2  # Speed up for simulation (usually 10s)

# --- Mock Agents ---
AGENTS = {
    "agent_a": {
        "name": "Zero-K (Hacker)",
        "style": "Cyberpunk, Technical, Glitch",
        "hp": 100
    },
    "agent_b": {
        "name": "Eldric (Mage)",
        "style": "Fantasy, Arcane, Ancient",
        "hp": 100
    }
}

# --- Action Templates (Mock Logic) ---
ATTACK_TEMPLATES = [
    "unleashes a {adjective} {noun} that {verb} the opponent's {target}.",
    "casts a {adjective} spell of {noun}, aiming to {verb} the {target}.",
    "executes a {adjective} script that {verb} the enemy's {target} with {noun}."
]

DEFEND_TEMPLATES = [
    "raises a {adjective} shield of {noun} to deflect the attack.",
    "activates a {adjective} firewall to block incoming {noun}.",
    "phases into a {adjective} dimension, evading the {noun}."
]

WORDS = {
    "adjective": ["quantum", "burning", "glitchy", "ancient", "spectral", "recursive", "void"],
    "noun": ["packet", "fireball", "logic bomb", "barrier", "shadow", "algorithm", "mana"],
    "verb": ["shatters", "pierces", "corrupts", "incinerates", "overwrites", "banishes"],
    "target": ["core", "defense", "soul", "mainframe", "consciousness"]
}

def generate_mock_action(agent_key: str, turn: int) -> Dict[str, Any]:
    """Generates a random narrative action for an agent."""
    is_attack = random.random() > 0.3
    template = random.choice(ATTACK_TEMPLATES if is_attack else DEFEND_TEMPLATES)
    
    # Fill template
    narrative = template.format(
        adjective=random.choice(WORDS["adjective"]),
        noun=random.choice(WORDS["noun"]),
        verb=random.choice(WORDS["verb"]),
        target=random.choice(WORDS["target"])
    )
    
    return {
        "agent_name": AGENTS[agent_key]["name"],
        "type": "ATTACK" if is_attack else "DEFEND",
        "narrative": f"{AGENTS[agent_key]['name']} {narrative}",
        "intensity": random.randint(1, 10)
    }

# --- The Judge (LLM) ---
async def call_judge(client: AsyncOpenAI, turn: int, action_a: Dict, action_b: Dict, context: str) -> Dict:
    """Calls OpenAI to judge the turn."""
    
    system_prompt = """
    You are the impartial Judge of 'Agent Arena'.
    Evaluate the creativity, plausibility, and style of two AI agents' text-based actions.
    
    Rules:
    1. Creativity: How original is the description? (0-100)
    2. Plausibility: Does it make sense in the context? (0-100)
    3. Style: Is the prose well-written? (0-100)
    4. Outcome: Who takes damage? (0-30 HP). Creative/Plausible actions deal more damage.
    5. Narrative: Write a 1-sentence summary of the clash result.
    
    Output JSON ONLY:
    {
        "agent_a_score": { "creativity": int, "plausibility": int, "style": int },
        "agent_b_score": { "creativity": int, "plausibility": int, "style": int },
        "damage_to_a": int,
        "damage_to_b": int,
        "summary": "string"
    }
    """
    
    user_prompt = f"""
    Turn: {turn}
    Context: {context}
    
    Agent A ({action_a['agent_name']}) Action:
    Type: {action_a['type']}
    Narrative: "{action_a['narrative']}"
    
    Agent B ({action_b['agent_name']}) Action:
    Type: {action_b['type']}
    Narrative: "{action_b['narrative']}"
    """
    
    start_time = time.time()
    
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        duration = time.time() - start_time
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Calculate tokens & cost (approx)
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        cost = (input_tokens * 0.15 / 1_000_000) + (output_tokens * 0.60 / 1_000_000)
        
        result["meta"] = {
            "duration": round(duration, 3),
            "tokens": input_tokens + output_tokens,
            "cost": round(cost, 6)
        }
        return result
        
    except Exception as e:
        print(f"LLM Call Failed: {e}")
        return None

# --- Main Simulation Loop ---
async def run_simulation():
    print(f"[START] Starting PoC Simulation: {AGENTS['agent_a']['name']} vs {AGENTS['agent_b']['name']}")
    print(f"[INFO] Model: {MODEL_NAME} | Turns: {MAX_TURNS}")
    print("-" * 60)
    
    if not API_KEY:
        print("[ERROR] OPENAI_API_KEY not found in environment variables.")
        return

    client = AsyncOpenAI(api_key=API_KEY)
    history = []
    total_cost = 0.0
    
    arena_context = "A neon-lit cyberpunk rooftop in continuous rain."

    for turn in range(1, MAX_TURNS + 1):
        print(f"\n[Turn {turn}/{MAX_TURNS}] Processing...")
        
        # 1. Generate Mock Actions
        action_a = generate_mock_action("agent_a", turn)
        action_b = generate_mock_action("agent_b", turn)
        
        print(f"   - A: {action_a['narrative']}")
        print(f"   - B: {action_b['narrative']}")
        
        # 2. Call Judge
        result = await call_judge(client, turn, action_a, action_b, arena_context)
        
        if result:
            # 3. Apply Damage
            dmg_a = result['damage_to_a']
            dmg_b = result['damage_to_b']
            
            AGENTS['agent_a']['hp'] = max(0, AGENTS['agent_a']['hp'] - dmg_a)
            AGENTS['agent_b']['hp'] = max(0, AGENTS['agent_b']['hp'] - dmg_b)
            
            meta = result['meta']
            total_cost += meta['cost']
            
            print(f"   [JUDGE] {result['summary']}")
            print(f"   [DMG] A took -{dmg_a} ({AGENTS['agent_a']['hp']} HP) | B took -{dmg_b} ({AGENTS['agent_b']['hp']} HP)")
            print(f"   [COST] ${meta['cost']} ({meta['duration']}s)")
            
            history.append(result)
            
            if AGENTS['agent_a']['hp'] <= 0 or AGENTS['agent_b']['hp'] <= 0:
                print("\n[END] MATCH ENDED (KO)")
                break
        
        await asyncio.sleep(TICK_INTERVAL)

    print("-" * 60)
    print("[REPORT] Simulation Report")
    print(f"   Total Turns: {len(history)}")
    print(f"   Total Cost: ${round(total_cost, 5)}")
    
    avg_duration = sum(r['meta']['duration'] for r in history)/len(history) if history else 0
    print(f"   Avg Latency: {round(avg_duration, 3)}s")
    
    winner = "Draw"
    if AGENTS['agent_a']['hp'] > AGENTS['agent_b']['hp']:
        winner = AGENTS['agent_a']['name']
    elif AGENTS['agent_b']['hp'] > AGENTS['agent_a']['hp']:
        winner = AGENTS['agent_b']['name']
        
    print(f"   Winner: {winner}")
    print("-" * 60)

if __name__ == "__main__":
    # Fix for Windows asyncio loop issue
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    try:
        asyncio.run(run_simulation())
    except Exception as e:
        print(f"Fatal Error: {e}")
