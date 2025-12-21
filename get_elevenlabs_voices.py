#!/usr/bin/env python3
"""
Script to fetch valid ElevenLabs voice IDs from your account.
Requires ELEVENLABS_API_KEY environment variable to be set.
"""

import os
import sys
import json
from typing import Optional

try:
    import requests
except ImportError:
    print("Error: requests library not installed. Install it with: pip install requests")
    sys.exit(1)


def get_voices(api_key: Optional[str] = None) -> None:
    """Fetch and display all available voices from ElevenLabs."""
    api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
    
    if not api_key:
        print("Error: ELEVENLABS_API_KEY environment variable not set.")
        print("Set it with: export ELEVENLABS_API_KEY='your-api-key'")
        sys.exit(1)
    
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {
        "xi-api-key": api_key
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        voices = data.get("voices", [])
        
        if not voices:
            print("No voices found in your account.")
            return
        
        print(f"\nFound {len(voices)} voice(s) in your ElevenLabs account:\n")
        print("-" * 80)
        
        for voice in voices:
            voice_id = voice.get("voice_id", "N/A")
            name = voice.get("name", "Unnamed")
            description = voice.get("description", "")
            category = voice.get("category", "")
            
            print(f"\nName: {name}")
            print(f"Voice ID: {voice_id}")
            if description:
                print(f"Description: {description}")
            if category:
                print(f"Category: {category}")
            print("-" * 80)
        
        print("\n\nTo use a voice, copy the Voice ID and paste it in the TTS Voice field.")
        print("Example: TX3LPaxmHKxFdv7VOQHJ")
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching voices: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        sys.exit(1)


if __name__ == "__main__":
    get_voices()










