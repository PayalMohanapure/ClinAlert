import os
import json
import base64
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv(override=True)

def extract_drugs_with_vision(image_bytes: bytes) -> list[str]:
    """
    Uses OpenAI's GPT-4o-mini Vision capabilities via LangChain to directly read 
    a prescription image and extract the names of medical drugs.
    Bypasses the need for any local OCR software like Tesseract.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("WARNING: No OpenAI API Key found in .env. Vision extraction will fail.")
        # Fallback to mock extraction for UI testing if no API key is provided
        return ["dolo", "pantoprazole"] 
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Convert image bytes to base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    message = HumanMessage(
        content=[
            {
                "type": "text", 
                "text": """You are a highly intelligent medical AI.
I am providing you with an image of a doctor's prescription.
Your ONLY job is to identify the names of the pharmaceutical drugs prescribed.

Return the result EXACTLY as a JSON array of lowercase strings representing the generic or brand drug names.
Do not include dosages (like 650mg, 10T) or instructions (like Take 1 tablet). 
Just the JSON array.
If you cannot read anything, return an empty array []."""
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
            }
        ]
    )
    
    try:
        response = llm.invoke([message])
        # Clean the response in case it wraps it in markdown ```json
        content = response.content.replace("```json", "").replace("```", "").strip()
        extracted_drugs = json.loads(content)
        return extracted_drugs
    except Exception as e:
        print(f"Vision AI Extraction Failed: {e}")
        return []
