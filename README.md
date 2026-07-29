# BatchMates 20 Runnable AI Agents

A BatchMates-themed web app for running 20 local AI agents from one shared UI. The app is designed around the BatchMates design system: Inter typography, blue brand gradient, light/dark themes, specialization-based browsing, and clean agent result cards.

## About The Creator

Built by **Tanmay** as a BatchMates-style AI agents workspace for students, operators, marketers, HR teams, and finance learners who want to run practical AI agents locally from a simple UI.

## What You Get

- 20 runnable Python agents with a shared Groq-first provider setup.
- First-run onboarding that asks for one Groq API key and saves it to the repo root `.env`.
- Specialization navigation for Finance, Operations, Marketing, and HR.
- An `All agents` view for browsing every agent.
- Agent detail pages explaining backend flow, inputs, processing steps, and output.
- A `Create your own agent` guide with prerequisites, build steps, and a short roadmap.
- Interactive 3D pipeline animation while an agent runs.
- Readable result cards with metrics, highlights, simple charts, and collapsible raw terminal output.

## Quick Start

```bash
git clone https://github.com/tanmay7264/20-runnable-ai-agents.git
cd 20-runnable-ai-agents

python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt

cd web
npm install
npm run dev:ui
```

Open `http://127.0.0.1:5174/`.

On first launch, the UI asks for your Groq API key, saves it into `.env`, then asks you to choose a specialization.

Or run the bootstrap script:

```bash
./setup.sh
cd web
npm run dev:ui
```

## Get a Free Groq API Key

1. Go to `https://console.groq.com/keys`.
2. Sign in or create a Groq account.
3. Create an API key.
4. Paste the key into the first-run setup screen.

The app stores it as:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

Do not commit `.env`.

## Specializations

| Specialization | Default Agents |
|---|---|
| Finance | SQL Query, Data Analysis, Stock Research, Competitive Analysis |
| Operations | Code Review, PDF Q&A, GitHub Issue Triager, Meeting Notes, Travel Planner, Customer Support, Unit Tests, Documentation, Debate |
| Marketing | Web Research, Email Drafting, News Summarizer, Social Media, Recipe, Competitive Analysis |
| HR | Email Drafting, Resume Parser, Meeting Notes, Job Application |

Use `All agents` in the navbar to view the full catalog anytime.

Use `Create your own agent` in the navbar to learn how to add a new local agent from scratch.

## Agent Index

| # | Agent | Folder | Specialization |
|---|---|---|---|
| 01 | Web Research Agent | `agents/01-web-research-agent` | Marketing |
| 02 | Code Review Agent | `agents/02-code-review-agent` | Operations |
| 03 | PDF Q&A Agent | `agents/03-pdf-qa-agent` | Operations |
| 04 | SQL Query Agent | `agents/04-sql-query-agent` | Finance |
| 05 | Email Drafting Agent | `agents/05-email-drafting-agent` | Marketing / HR |
| 06 | News Summarizer Agent | `agents/06-news-summarizer-agent` | Marketing |
| 07 | GitHub Issue Triager | `agents/07-github-issue-triager` | Operations |
| 08 | Data Analysis Agent | `agents/08-data-analysis-agent` | Finance |
| 09 | Resume Parser Agent | `agents/09-resume-parser-agent` | HR |
| 10 | Meeting Notes Agent | `agents/10-meeting-notes-agent` | Operations / HR |
| 11 | Stock Research Agent | `agents/11-stock-research-agent` | Finance |
| 12 | Travel Planner Agent | `agents/12-travel-planner-agent` | Operations |
| 13 | Customer Support Agent | `agents/13-customer-support-agent` | Operations |
| 14 | Social Media Content Agent | `agents/14-social-media-agent` | Marketing |
| 15 | Unit Test Generator Agent | `agents/15-unit-test-generator` | Operations |
| 16 | Documentation Writer Agent | `agents/16-documentation-writer` | Operations |
| 17 | Recipe Recommendation Agent | `agents/17-recipe-agent` | Marketing |
| 18 | Job Application Agent | `agents/18-job-application-agent` | HR |
| 19 | Competitive Analysis Agent | `agents/19-competitive-analysis-agent` | Finance / Marketing |
| 20 | Multi-Agent Debate System | `agents/20-multi-agent-debate` | Operations |

## Running From The UI

1. Start the app with `npm run dev:ui` inside `web`.
2. Choose a specialization in the navbar.
3. Open an agent card.
4. Fill the input form.
5. Click `Run agent`.
6. Watch the 3D pipeline animation and read the formatted output report.

The UI calls `POST /api/run-agent`, runs the selected `agent.py`, captures stdout/stderr, and renders both a readable report and the raw terminal log.

## Running From The Terminal

You can still run agents directly:

```bash
source .venv/bin/activate
python agents/19-competitive-analysis-agent/agent.py \
  --company "Nykaa" \
  --industry "beauty ecommerce in India"
```

For one-time terminal setup without the UI:

```bash
./setup.sh
```

## Provider Setup

All agents read shared provider config from the repo root `.env` through `agents/common.py`.

Groq is the default provider. Optional providers can be configured in `.env.example`, but the UI is optimized for Groq.

## Python Version

Use Python 3.13 for the smoothest classroom setup. Some current CrewAI releases may not install cleanly on Python 3.14.

## Notes

- Secrets are excluded through `.gitignore`.
- `.setup.json` stores the selected specialization.
- The BatchMates UI lives in `web/`.
- The original external catalog pages were removed from the live UI so the app stays focused on these 20 runnable agents.
