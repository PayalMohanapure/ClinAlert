import requests
import json

url = "http://127.0.0.1:8000/api/v1/auth/login"
payload = {
    "email": "demo@clinalert.com",
    "password": "password123"
}
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
