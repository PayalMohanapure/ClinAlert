import os
import time
from playwright.sync_api import sync_playwright

PRESCRIPTIONS_DIR = "d:\\ClinAlert\\test_prescriptions"
RESULTS_DIR = "d:\\ClinAlert\\test_results"

os.makedirs(RESULTS_DIR, exist_ok=True)

def run_tests():
    images = [f for f in os.listdir(PRESCRIPTIONS_DIR) if f.endswith('.jpg')]
    images.sort()
    
    if not images:
        print("No prescription images found to test.")
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a new context so cookies/localstorage persist across the test run
        context = browser.new_context()
        page = context.new_page()
        
        # 1. Initial Login
        print("Logging in...")
        page.goto("http://localhost:5173/login")
        page.fill('input[type="email"]', 'doctor@clinalert.com')
        page.fill('input[type="password"]', 'password123')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard', timeout=10000)
        print("Logged in successfully.")

        success_count = 0
        
        for idx, image_name in enumerate(images):
            image_path = os.path.join(PRESCRIPTIONS_DIR, image_name)
            print(f"[{idx+1}/{len(images)}] Testing: {image_name}")
            
            try:
                # 2. Navigate to Upload using the Navbar link (SPA navigation)
                page.click('a:has-text("Upload")')
                
                # 3. Wait for the file input to appear
                page.wait_for_selector("input#file-upload", state="attached", timeout=10000)
                
                # 4. Upload file
                page.set_input_files('input#file-upload', image_path)
                
                # 5. Wait for preview to appear and button to enable
                page.wait_for_selector('button:has-text("Start AI Analysis"):not([disabled])', timeout=10000)
                
                # 6. Click Scan
                page.click('button:has-text("Start AI Analysis")')
                
                # 7. Wait for result page navigation (Backend AI Processing takes time)
                page.wait_for_url('**/result/*', timeout=30000)
                page.wait_for_selector('text=Analysis Report', timeout=15000)
                
                # 8. Take screenshot
                screenshot_path = os.path.join(RESULTS_DIR, f"result_{image_name}.png")
                page.screenshot(path=screenshot_path, full_page=True)
                
                print(f"  [SUCCESS] Saved {screenshot_path}")
                success_count += 1
                
            except Exception as e:
                print(f"  [FAILED] on {image_name}: {e}")
                
        context.close()
        browser.close()
        
        print("\n" + "="*40)
        print(f"BULK TESTING COMPLETE")
        print(f"Successfully processed {success_count} out of {len(images)} prescriptions.")
        print("="*40)

if __name__ == "__main__":
    run_tests()
