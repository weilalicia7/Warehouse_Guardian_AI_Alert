"""
Test Gemini API and list available models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("[ERROR] GEMINI_API_KEY not found")
    exit(1)

print("[*] Testing Gemini API")
print(f"[i] API Key: {api_key[:10]}...")
print()

# Configure Gemini
genai.configure(api_key=api_key)

# List available models
print("[*] Listing available models...")
try:
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
            print(f"    Description: {model.description}")
            print()
except Exception as e:
    print(f"[ERROR] Failed to list models: {e}")
    print()

# Try different model names
model_names_to_try = [
    'models/gemini-pro',
    'gemini-pro',
    'models/gemini-1.5-pro',
    'gemini-1.5-pro',
    'models/gemini-1.5-flash',
    'gemini-1.5-flash'
]

print("[*] Testing model names...")
for model_name in model_names_to_try:
    try:
        print(f"\n[TEST] Trying: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello in one word")
        print(f"  ✅ SUCCESS! Response: {response.text}")
        print(f"  [i] Use this model name: {model_name}")
        break
    except Exception as e:
        print(f"  ❌ Failed: {str(e)[:100]}")
