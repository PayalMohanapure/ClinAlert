import requests

BASE_URL = "http://127.0.0.1:8000"

accounts = [
    {"email": "demo@clinalert.com", "password": "password123"},
    {"email": "dr.sharma@clinalert.com", "password": "pass1234"},
    {"email": "dr.patel@clinalert.com", "password": "pass1234"},
    {"email": "dr.kumar@clinalert.com", "password": "pass1234"},
    {"email": "dr.singh@clinalert.com", "password": "pass1234"},
    {"email": "dr.gupta@clinalert.com", "password": "pass1234"},
    {"email": "dr.khan@clinalert.com", "password": "pass1234"},
    {"email": "dr.reddy@clinalert.com", "password": "pass1234"},
    {"email": "dr.joshi@clinalert.com", "password": "pass1234"},
    {"email": "dr.verma@clinalert.com", "password": "pass1234"},
]

print("=" * 60)
print("TESTING LOGIN WITH ALL 10 ACCOUNTS")
print("=" * 60)

success_count = 0
fail_count = 0

for acc in accounts:
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": acc["email"], "password": acc["password"]}
        )
        if response.status_code == 200:
            data = response.json()
            user_name = data["user"]["full_name"]
            print(f"  [PASS] {acc['email']} -> {user_name}")
            success_count += 1
        else:
            print(f"  [FAIL] {acc['email']} -> Status {response.status_code}: {response.text[:100]}")
            fail_count += 1
    except Exception as e:
        print(f"  [ERROR] {acc['email']} -> {e}")
        fail_count += 1

print("")
print("=" * 60)
print(f"RESULTS: {success_count}/10 PASSED, {fail_count}/10 FAILED")
print("=" * 60)
