from fastapi.testclient import TestClient
import sys
import os

# Ensure Python can find our backend API
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

# Create a simulated Web Browser to test our API without needing Uvicorn running
client = TestClient(app)

def test_health_check():
    """Test that the API server boots up properly."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ClinAlert API is running!"}

def test_search_drug_brand_fuzzy():
    """Test that typing a Brand Name resolves to the correct Generic Name."""
    response = client.get("/api/v1/search?q=dolo")
    assert response.status_code == 200
    
    data = response.json()
    assert data["generic_name"] == "Paracetamol"
    assert data["matched_brand"] != None
    
    # Assert that our data aggregation arrays successfully loaded
    assert type(data["alerts"]) is list
    assert type(data["side_effects"]) is list
    assert type(data["cheaper_alternatives"]) is list

def test_search_drug_generic():
    """Test that searching by Generic Name directly also works."""
    response = client.get("/api/v1/search?q=paracetamol")
    assert response.status_code == 200
    
    data = response.json()
    assert data["generic_name"] == "Paracetamol"
    
def test_search_not_found():
    """Test that our API handles errors gracefully if a drug doesn't exist."""
    response = client.get("/api/v1/search?q=thisdrugdoesnotexist123")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
