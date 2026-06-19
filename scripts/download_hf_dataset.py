import os
from datasets import load_dataset

DATA_DIR = "d:\\ClinAlert\\test_prescriptions"
os.makedirs(DATA_DIR, exist_ok=True)

print("Loading HuggingFace dataset 'chaithanyakota/100-handwritten-medical-records'...")
try:
    # Use split="train" or take the default split
    dataset = load_dataset('chaithanyakota/100-handwritten-medical-records', split='train')
    
    print(f"Successfully loaded dataset with {len(dataset)} examples.")
    
    # We only need 30 images for testing
    num_to_download = min(30, len(dataset))
    print(f"Downloading first {num_to_download} images...")
    
    for i in range(num_to_download):
        example = dataset[i]
        # The image feature is usually a PIL Image object in HF datasets
        img = example['image']
        
        filepath = os.path.join(DATA_DIR, f"real_prescription_{i+1:02d}.jpg")
        
        # Convert to RGB in case it has an alpha channel (RGBA)
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        img.save(filepath)
        print(f"Saved {filepath}")
        
    print(f"\n[SUCCESS] Successfully downloaded and saved {num_to_download} real prescription images to {DATA_DIR}!")

except Exception as e:
    print(f"[FAILED] to download dataset: {e}")
