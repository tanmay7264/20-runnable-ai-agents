import os
from pathlib import Path

from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def load_project_env(agent_file: str | None = None) -> None:
    load_dotenv(ROOT / ".env")
    if agent_file:
        load_dotenv(Path(agent_file).resolve().parent / ".env")


def chat_llm(model_env: str = "AI_MODEL", temperature: float = 0, model: str | None = None):
    from langchain_openai import ChatOpenAI

    provider = (os.getenv("AI_PROVIDER") or "groq").lower()

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Set GROQ_API_KEY in the repo root .env. Run ./setup.sh to create it.")
        return ChatOpenAI(
            model=os.getenv(model_env) or os.getenv("GROQ_MODEL", GROQ_MODEL),
            api_key=api_key,
            base_url=os.getenv("GROQ_BASE_URL", GROQ_BASE_URL),
            temperature=temperature,
        )

    if provider == "xai":
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise RuntimeError("Set XAI_API_KEY in the repo root .env.")
        return ChatOpenAI(
            model=os.getenv(model_env) or os.getenv("XAI_MODEL", "grok-4.5"),
            api_key=api_key,
            base_url=os.getenv("XAI_BASE_URL", "https://api.x.ai/v1"),
            temperature=temperature,
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set GROQ_API_KEY in the repo root .env, or set AI_PROVIDER=openai with OPENAI_API_KEY.")
    return ChatOpenAI(
        model=os.getenv(model_env) or model or os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        api_key=api_key,
        temperature=temperature,
    )


def llama_index_llm(model_env: str = "AI_MODEL", temperature: float = 0):
    from llama_index.llms.openai import OpenAI

    provider = (os.getenv("AI_PROVIDER") or "groq").lower()
    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Set GROQ_API_KEY in the repo root .env. Run ./setup.sh to create it.")
        return OpenAI(
            model=os.getenv(model_env) or os.getenv("GROQ_MODEL", GROQ_MODEL),
            api_key=api_key,
            api_base=os.getenv("GROQ_BASE_URL", GROQ_BASE_URL),
            temperature=temperature,
        )

    if provider == "xai":
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise RuntimeError("Set XAI_API_KEY in the repo root .env.")
        return OpenAI(
            model=os.getenv(model_env) or os.getenv("XAI_MODEL", "grok-4.5"),
            api_key=api_key,
            api_base=os.getenv("XAI_BASE_URL", "https://api.x.ai/v1"),
            temperature=temperature,
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set GROQ_API_KEY in the repo root .env, or set AI_PROVIDER=openai with OPENAI_API_KEY.")
    return OpenAI(
        model=os.getenv(model_env) or os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        api_key=api_key,
        temperature=temperature,
    )


def crew_llm(temperature: float = 0, model: str | None = None):
    from crewai import LLM

    provider = (os.getenv("AI_PROVIDER") or "groq").lower()
    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("Set GROQ_API_KEY in the repo root .env. Run ./setup.sh to create it.")
        return LLM(
            model=f"groq/{os.getenv('GROQ_MODEL', GROQ_MODEL)}",
            api_key=api_key,
            temperature=temperature,
        )

    if provider == "xai":
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise RuntimeError("Set XAI_API_KEY in the repo root .env.")
        return LLM(
            model=f"xai/{os.getenv('XAI_MODEL', 'grok-4.5')}",
            api_key=api_key,
            temperature=temperature,
        )

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set GROQ_API_KEY in the repo root .env, or set AI_PROVIDER=openai with OPENAI_API_KEY.")
    return LLM(
        model=os.getenv("OPENAI_MODEL") or model or "gpt-4o-mini",
        api_key=api_key,
        temperature=temperature,
    )
