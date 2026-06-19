import requests
url = "https://clinalert.onrender.com/api/v1/auth/login"
payload = {"email": "demo@clinalert.com", "password": "password123"}
try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
