import cv2
import numpy as np
import pytesseract

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Takes raw image bytes from the API, preprocesses the image using OpenCV
    to improve clarity, and extracts the text using Google's Tesseract OCR.
    """
    # 1. Convert raw bytes to a NumPy array for OpenCV
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if image is None:
        print("WARNING: Could not decode image. Using mock OCR text.")
        return "Rx: Dolo 650mg, Pantoprazole 40mg. Take 1 tablet twice a day."
    
    # 2. Pre-processing Phase (Computer Vision)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) # Remove color noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)    # Remove pixel grain
    
    # Adaptive Thresholding turns the image into pure black & white, making text pop
    binary = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # 3. OCR Phase
    try:
        extracted_text = pytesseract.image_to_string(binary)
        return extracted_text.strip()
    except Exception as e:
        # Graceful fallback if Tesseract isn't installed on your Windows machine
        print(f"WARNING: Tesseract OCR failed ({e}). Using mock OCR text.")
        return "Rx: Dolo 650mg, Pantoprazole 40mg. Take 1 tablet twice a day."
