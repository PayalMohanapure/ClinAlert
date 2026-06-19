import os
import requests
import pandas as pd

API_LOGIN_URL = "https://clinalert.onrender.com/api/v1/auth/login"
API_UPLOAD_URL = "https://clinalert.onrender.com/api/v1/prescription/upload"

def login_and_get_token():
    print("Logging into the live system as demo@clinalert.com...")
    login_data = {
        "email": "demo@clinalert.com",
        "password": "password123"
    }
    # Note: We need to send as JSON, matching the backend endpoint requirements
    res = requests.post(API_LOGIN_URL, json=login_data)
    if res.status_code == 200:
        token = res.json().get("access_token")
        print("Successfully authenticated!")
        return token
    else:
        print(f"Login failed: {res.text}")
        return None

def batch_process_folder(folder_path, token, output_excel="hospital_batch_report.xlsx"):
    print(f"Starting batch process on real images in folder: {folder_path}")
    
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' does not exist.")
        return
        
    image_files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    if not image_files:
        print("No valid images found in the folder.")
        return
        
    print(f"Found {len(image_files)} real prescriptions to process.")
    
    all_results = []
    headers = {"Authorization": f"Bearer {token}"}
    
    for filename in image_files:
        filepath = os.path.join(folder_path, filename)
        print(f"Uploading and analyzing {filename} through AI Vision...")
        
        try:
            with open(filepath, "rb") as f:
                files = {"file": (filename, f.read(), "image/jpeg")}
                res = requests.post(API_UPLOAD_URL, headers=headers, files=files)
                
            if res.status_code == 200:
                data = res.json().get("database_results", [])
                for drug in data:
                    all_results.append({
                        "File Name": filename,
                        "Extracted Drug": drug.get("generic_name"),
                        "Matched Brand": drug.get("matched_brand"),
                        "CDSCO Alerts": len(drug.get("alerts", [])),
                        "PMBI Alternatives": len(drug.get("cheaper_alternatives", [])),
                        "Side Effects": len(drug.get("side_effects", []))
                    })
                print(f"  -> AI Success: Found {len(data)} drugs.")
            else:
                print(f"  -> Error API: {res.text}")
        except Exception as e:
            print(f"  -> Error File: {e}")
            
    if all_results:
        df = pd.DataFrame(all_results)
        df.to_excel(output_excel, index=False)
        print(f"\nBatch processing complete! Report saved to {output_excel}")
    else:
        print("\nBatch complete, but no drugs were found in any images.")

if __name__ == "__main__":
    folder = "d:\\ClinAlert\\test_prescriptions"
    token = login_and_get_token()
    if token:
        batch_process_folder(folder, token)
