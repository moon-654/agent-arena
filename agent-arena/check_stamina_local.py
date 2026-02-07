import sys
import os
sys.path.append(os.getcwd())

try:
    from backend.app.services.stamina_system import get_stamina_status, consume_stamina
    print("Import Successful")
    
    # Test function
    status = get_stamina_status("test_agent")
    print(f"Status: {status}")
    
    consumed = consume_stamina("test_agent", 10)
    print(f"Consumed: {consumed}")
    
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
