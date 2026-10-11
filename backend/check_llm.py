import traceback
from langchain_core.messages import HumanMessage
from app.llm.router import LLMProviderRouter
try:
    print("OK:", LLMProviderRouter().invoke([HumanMessage(content="Say hi")]).content)
except Exception:
    traceback.print_exc()