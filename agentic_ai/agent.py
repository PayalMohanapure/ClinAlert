import os
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from database.crud import search_drug
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert_db")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@tool
def lookup_drug_database(query: str) -> str:
    """
    Use this tool to search the PostgreSQL Database for a drug (brand or generic).
    It returns verified PMBI pricing alternatives, CDSCO regulatory alerts, and SIDER side effects.
    """
    db = SessionLocal()
    try:
        result = search_drug(db, query)
        if not result:
            return f"No database records found for drug '{query}'."
        
        # Format the Pydantic schema into a readable string for the LLM
        output = f"Generic Name: {result.generic_name}\n"
        if result.matched_brand:
            output += f"Brand Name: {result.matched_brand}\n"
            
        output += "\n--- CDSCO Regulatory Alerts ---\n"
        if result.alerts:
            for alert in result.alerts:
                output += f"WARNING: {alert.alert_title} - {alert.description} (Date: {alert.alert_date})\n"
        else:
            output += "No active alerts.\n"
            
        output += "\n--- PMBI Pricing Alternatives ---\n"
        if result.cheaper_alternatives:
            for alt in result.cheaper_alternatives:
                output += f"Generic {alt.brand_name} is available for ₹{alt.mrp}\n"
        else:
            output += "No subsidized pricing found.\n"
            
        return output
    finally:
        db.close()

from agentic_ai.rag_system import query_rag

@tool
def query_clinical_guidelines(question: str) -> str:
    """
    Use this tool to query the Vector Database (RAG) for official Clinical Guidelines, 
    CDSCO Protocols, or PMBI Pricing Policies. 
    Use this when the user asks a complex regulatory or medical question.
    """
    return query_rag(question)

def get_medical_agent():
    """Initializes the Agentic AI with its tools."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing from .env")
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, max_retries=3, timeout=60)
    
    tools = [lookup_drug_database, query_clinical_guidelines]
    
    prompt = "You are ClinAlert's Advanced Agentic Medical AI. You have access to a PostgreSQL Database (for drug prices and alerts) and a Vector RAG Database (for clinical guidelines). When a doctor asks a question: 1. Decide which tool to use. 2. Execute the tool. 3. Provide a highly professional, concise, clinical response based on the tool's output. Always prioritize patient safety and regulatory compliance."
    
    agent = create_react_agent(llm, tools, prompt=prompt)
    return agent

def run_agent_query(user_query: str) -> str:
    """Executes the agent workflow and returns the final string response."""
    try:
        agent = get_medical_agent()
        # The agent returns a dictionary with 'messages', the last message is the AI response
        inputs = {"messages": [("user", user_query)]}
        response = agent.invoke(inputs)
        return response["messages"][-1].content
    except Exception as e:
        return f"Agent Error: {str(e)}. (Please ensure OpenAI API Key is set in .env)"
