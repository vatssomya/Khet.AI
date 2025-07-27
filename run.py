
"""
Khet.ai Flask Application Startup Script
Run this script to start the agricultural platform
"""

import os
import sys
from app import app

if __name__ == '__main__':
    print("🌾 Starting Khet.ai - AI-Powered Agricultural Platform")
    print("📱 Access the application at: http://localhost:5000")
    print("🔧 Debug mode enabled for development")
    print("-" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n🛑 Application stopped by user")
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)