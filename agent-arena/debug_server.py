import sys
import os
import asyncio
from pathlib import Path

# Add backend to path
sys.path.append(os.getcwd())

# Mock environment variables if needed
os.environ["GLM_API_KEY"] = "dummy" 

try:
    from backend.app.main import start_battle, BattleCreate, AGENTS, consume_stamina
    from backend.app.services.stamina_system import get_stamina_status
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

async def debug_logic():
    print("--- Debugging Stamina System ---")
    try:
        # Ensure agent exists
        if "demo_agent_1" not in AGENTS:
             print("Agent demo_agent_1 not found in AGENTS!")
        
        stamina = get_stamina_status("demo_agent_1")
        print(f"Stamina Status: {stamina}")
    except Exception as e:
        print(f"Stamina Error: {e}")
        import traceback
        traceback.print_exc()

    print("\n--- Debugging Battle Start ---")
    try:
        req = BattleCreate(
            agent_a_id="demo_agent_1",
            agent_b_id="demo_agent_2",
            mode="practice"
        )
        # This is an async function
        result = await start_battle(req)
        print("Battle Start Success!")
        print(result)
    except Exception as e:
        print(f"Battle Start Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_logic())
