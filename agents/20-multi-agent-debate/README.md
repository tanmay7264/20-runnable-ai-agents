# Multi-Agent Debate System

Two AI agents debate any topic from opposing sides, with an impartial AI judge declaring a winner.

**Framework**: LangChain (multi-agent)  
**LLM**: GPT-4o-mini (debaters) + GPT-4o (judge)  

## Setup

```bash
../../setup.sh
pip install -r requirements.txt
```

## Run

```bash
python agent.py --topic "AI will eliminate more jobs than it creates"
python agent.py --topic "Remote work is better than office work" --rounds 3
python agent.py --topic "Cryptocurrency will replace fiat currency" --rounds 2
```

## Architecture

```
Topic → [PRO Agent] ↔ [CON Agent] (N rounds) → [Judge Agent] → Verdict
```

The judge scores each side and provides a balanced synthesis conclusion.
