# Documentation Writer Agent

Generates comprehensive documentation for Python modules: README, API reference, and Google-style docstrings.

**Framework**: LangChain  
**LLM**: GPT-4o  

## Setup

```bash
../../setup.sh
pip install -r requirements.txt
```

## Run

```bash
# Generate README + docstrings
python agent.py --file my_module.py

# README only
python agent.py --file utils.py --format readme

# Docstrings only  
python agent.py --file api.py --format docstrings
```
