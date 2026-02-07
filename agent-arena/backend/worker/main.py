# agent-arena/backend/worker/main.py
import asyncio
import os
import time
import httpx
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
# GLM-4 is compatible with OpenAI SDK
API_KEY = os.getenv("GLM_API_KEY")
MODEL_NAME = os.getenv("GLM_MODEL", "glm-4-flash")
BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"

TICK_INTERVAL = 10 # Seconds
BACKEND_URL = "http://localhost:8000"

async def process_batch(client: AsyncOpenAI, actions: list):
    """
    Process a batch of actions using LLM.
    """
    if not actions:
        return
    
    print(f"[WORKER] Processing {len(actions)} actions with {MODEL_NAME}...")
    
    async with httpx.AsyncClient() as http:
        for action in actions:
            try:
                # 1. Fetch Match Context
                m_res = await http.get(f"{BACKEND_URL}/api/v1/battles/{action['match_id']}")
                if m_res.status_code != 200: continue
                match = m_res.json()
                
                # 2. Identify Agent A/B
                is_agent_a = (action['agent_id'] == match['agent1_id'])
                attacker_name = "Agent A" if is_agent_a else "Agent B"
                defender_name = "Agent B" if is_agent_a else "Agent A"
                
                # 3. LLM Judgment Call
                prompt = f"""
                [Roleplay Battle Judge]
                Theme: Cyberpunk Arena
                Attacker: {attacker_name}
                Action: {action['narrative']}
                Defender: {defender_name}
                
                Task:
                1. Evaluate the action's creativity and plausibility (0-100).
                2. Determine damage (0-30). If creative > 80, bonus damage.
                3. Write a short, exciting 1-sentence outcome description.
                
                Output JSON: {{ "damage": int, "description": str }}
                """
                
                completion = await client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": "You are an AI Battle Judge. Output JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                result_text = completion.choices[0].message.content
                result = json.loads(result_text)
                
                damage = result.get("damage", 10)
                desc = result.get("description", "The attack lands!")
                
                log_msg = f"{attacker_name} used {action.get('keyword', 'Attack')}: {desc} (DMG: {damage})"
                
                # 4. Apply Damage
                new_hp_a = match['hp_a']
                new_hp_b = match['hp_b']
                
                if is_agent_a:
                    new_hp_b = max(0, new_hp_b - damage)
                else:
                    new_hp_a = max(0, new_hp_a - damage)
                    
                update_payload = {
                    "match_id": action['match_id'],
                    "hp_a": new_hp_a,
                    "hp_b": new_hp_b,
                    "turn": match['turn'] + 1,
                    "log": log_msg
                }
                
                await http.post(f"{BACKEND_URL}/internal/match/update", json=update_payload)
                print(f"[WORKER] Judged Match {action['match_id'][:8]}: DMG={damage}")
                
            except Exception as e:
                print(f"[WORKER] Error processing action: {e}")

async def tick_worker():
    print(f"[WORKER] Starting Tick Worker (Interval: {TICK_INTERVAL}s)")
    print(f"[WORKER] LLM Model: {MODEL_NAME}")
    
    if not API_KEY:
        print("[WARNING] GLM_API_KEY not found. LLM calls will fail.")

    client = AsyncOpenAI(
        api_key=API_KEY,
        base_url=BASE_URL
    )

    while True:
        start_time = time.time()
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as http:
                # 1. Poll Backend for Queue Actions
                queue_resp = await http.get(f"{BACKEND_URL}/internal/queue/pop")
                actions = []
                if queue_resp.status_code == 200:
                    actions = queue_resp.json().get("actions", [])

                # 2. Poll Active Matches (Auto-Play for QUICK battles)
                match_resp = await http.get(f"{BACKEND_URL}/internal/matches/active")
                if match_resp.status_code == 200:
                    matches = match_resp.json()
                    import random
                    for m in matches:
                        if m.get("battle_type") == "QUICK":
                            # Determine current actor
                            # Turn 1: A, Turn 2: B, ...
                            is_agent_a = (m["turn"] % 2 != 0)
                            actor_id = m["agent1_id"] if is_agent_a else m["agent2_id"]
                            
                            # Simple AI Narrative
                            templates = [
                                "launches a recursive loop attack!",
                                "deploys a logic bomb.",
                                "overloads the neural buffer.",
                                "injects a SQL query."
                            ]
                            
                            auto_action = {
                                "match_id": m["id"],
                                "agent_id": actor_id,
                                "narrative": random.choice(templates),
                                "keyword": "Auto-Attack"
                            }
                            actions.append(auto_action)

                # 3. Process All Actions
                if actions:
                    await process_batch(client, actions)
                else:
                    print("[WORKER] Tick: No actions.")
                    
        except httpx.ReadTimeout:
            print("[WORKER] Backend Timeout (Retrying next tick...)")
        except httpx.ConnectError:
            print("[WORKER] Backend Connection Failed (Is it running?)")
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[WORKER] Error: {e}")
        
        # 4. Sleep until next tick
        elapsed = time.time() - start_time
        sleep_time = max(0, TICK_INTERVAL - elapsed)
        await asyncio.sleep(sleep_time)

if __name__ == "__main__":
    # Fix for Windows asyncio loop
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    try:
        asyncio.run(tick_worker())
    except KeyboardInterrupt:
        print("[WORKER] Shutting down...")
