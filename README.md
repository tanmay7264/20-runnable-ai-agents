# 20 Runnable AI Agents

This repository contains the 20 locally runnable AI agents extracted from the larger `500-AI-Agents-Projects` catalog. Each agent is self-contained with its own `agent.py`, `README.md`, `requirements.txt`, `.env.example`, and metadata.

## Quick Start

```bash
git clone https://github.com/tanmay7264/20-runnable-ai-agents.git
cd 20-runnable-ai-agents

cd agents/19-competitive-analysis-agent
python3 -m pip install -r requirements.txt
cp .env.example .env
python3 agent.py --company "Nykaa" --industry "beauty ecommerce in India"
```

Most agents use an LLM provider key. Copy the agent's `.env.example` to `.env` and add your own key. Do not commit `.env` files.

## Agent Index

| # | Agent | Folder | Specialization |
|---|---|---|---|
| 01 | Web Research Agent | `agents/01-web-research-agent` | Marketing / Research |
| 02 | Code Review Agent | `agents/02-code-review-agent` | Operations / Software QA |
| 03 | PDF Q&A Agent | `agents/03-pdf-qa-agent` | Operations / Knowledge |
| 04 | SQL Query Agent | `agents/04-sql-query-agent` | Finance / Operations |
| 05 | Email Drafting Agent | `agents/05-email-drafting-agent` | HR / Communications |
| 06 | News Summarizer Agent | `agents/06-news-summarizer-agent` | Marketing / Finance |
| 07 | GitHub Issue Triager | `agents/07-github-issue-triager` | Operations / DevOps |
| 08 | Data Analysis Agent | `agents/08-data-analysis-agent` | Finance / Operations |
| 09 | Resume Parser Agent | `agents/09-resume-parser-agent` | HR |
| 10 | Meeting Notes Agent | `agents/10-meeting-notes-agent` | Operations / HR |
| 11 | Stock Research Agent | `agents/11-stock-research-agent` | Finance |
| 12 | Travel Planner Agent | `agents/12-travel-planner-agent` | Operations |
| 13 | Customer Support Agent | `agents/13-customer-support-agent` | Marketing / Customer Experience |
| 14 | Social Media Content Agent | `agents/14-social-media-agent` | Marketing |
| 15 | Unit Test Generator Agent | `agents/15-unit-test-generator` | Operations / Software QA |
| 16 | Documentation Writer Agent | `agents/16-documentation-writer` | Operations / Documentation |
| 17 | Recipe Recommendation Agent | `agents/17-recipe-agent` | Marketing / Personalization |
| 18 | Job Application Agent | `agents/18-job-application-agent` | HR |
| 19 | Competitive Analysis Agent | `agents/19-competitive-analysis-agent` | Marketing / Strategy |
| 20 | Multi-Agent Debate System | `agents/20-multi-agent-debate` | Operations / Decision Support |

## Classroom Workflow

1. Pick one agent folder.
2. Read its local `README.md`.
3. Install dependencies with `python3 -m pip install -r requirements.txt`.
4. Copy `.env.example` to `.env`.
5. Add your own API keys.
6. Run `python3 agent.py`.
7. Extend the agent for your specialization.

## Recommended Assignments

- HR: Resume Parser Agent, Job Application Agent, Meeting Notes Agent
- Finance: Stock Research Agent, SQL Query Agent, Data Analysis Agent
- Marketing: Competitive Analysis Agent, Social Media Content Agent, Web Research Agent
- Operations: Customer Support Agent, GitHub Issue Triager, Meeting Notes Agent, Documentation Writer Agent

## Notes

- This repo intentionally includes only the 20 local runnable agents.
- External catalog links and the React atlas UI from the original project are not included.
- Secrets are excluded through `.gitignore`.
