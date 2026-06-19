import os
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

def initialize_rag() -> FAISS:
    """
    Initializes a FAISS Vector Database and loads it with Medical/Clinical Guidelines.
    In a production system, this would load from a folder of PDFs.
    For this build, we inject highly specific mock guidelines so the RAG can be tested.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("WARNING: RAG System requires OPENAI_API_KEY. RAG will fail until key is provided.")
        # Return a dummy FAISS index if no key to prevent crashes during boot
        from langchain_community.embeddings import FakeEmbeddings
        embeddings = FakeEmbeddings(size=1536)
    else:
        embeddings = OpenAIEmbeddings(max_retries=3, request_timeout=60)

    # High-value clinical knowledge documents for the RAG to memorize
    clinical_documents = [
        Document(
            page_content="CDSCO Guideline 2026: Any pharmaceutical batch containing Paracetamol that fails the dissolution test must be immediately recalled from all pharmacies within 48 hours. Doctors are advised to prescribe Ibuprofen or alternative NSAIDs instead.",
            metadata={"source": "CDSCO_NSQ_Guidelines_2026.pdf", "page": 12}
        ),
        Document(
            page_content="PMBI Subsidized Pricing Policy: Generic Pantoprazole 40mg under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBI) is capped at exactly ₹15.00 per strip of 10 tablets. Any brand charging over ₹50 is subject to regulatory review.",
            metadata={"source": "PMBI_Pricing_Policy.pdf", "page": 4}
        ),
        Document(
            page_content="Pediatric Dosage Alert: Dolo Drops (Paracetamol for infants) should not exceed 15 mg/kg per dose. Overdosing has been linked to acute hepatic failure according to the SIDER medical side effects database.",
            metadata={"source": "SIDER_Pediatric_Safety.pdf", "page": 88}
        ),
        Document(
            page_content="Spurious Drug Protocol: If a batch of Azithromycin is flagged as Spurious or Counterfeit by the CDSCO, it indicates illegal manufacturing. The batch number must be reported to the local FDA inspector immediately.",
            metadata={"source": "FDA_Counterfeit_Protocol.pdf", "page": 2}
        )
    ]

    print("Building FAISS Vector Database with Clinical Guidelines...")
    vector_store = FAISS.from_documents(clinical_documents, embeddings)
    return vector_store

# Global singleton so we don't rebuild the vector store on every API request
VECTOR_STORE = None

def get_vector_store():
    global VECTOR_STORE
    if VECTOR_STORE is None:
        VECTOR_STORE = initialize_rag()
    return VECTOR_STORE

def query_rag(question: str) -> str:
    """Queries the Vector Store to find the most relevant clinical guideline."""
    vs = get_vector_store()
    
    # Retrieve top 2 most relevant paragraphs
    docs = vs.similarity_search(question, k=2)
    
    if not docs:
        return "No relevant clinical guidelines found in the database."
        
    response = "Based on Clinical Guidelines:\n"
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        response += f"- [{source}]: {doc.page_content}\n"
        
    return response
