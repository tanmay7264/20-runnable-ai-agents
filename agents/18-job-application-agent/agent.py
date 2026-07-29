"""
Job Application Agent using a shared Groq-backed LLM.

Analyzes a job description and a candidate profile, then generates:
- Tailored cover letter
- Resume bullet points to highlight
- Interview preparation questions

Usage:
    python agent.py --job-desc "Senior Python Engineer at Stripe..." --candidate "7 years Python, FastAPI..."
"""

import argparse
import os

from langchain_core.messages import HumanMessage, SystemMessage

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
from common import chat_llm, load_project_env

load_project_env(__file__)

SAMPLE_JOB = """Senior Python Engineer at Stripe
We're looking for a Senior Python Engineer to join our API Platform team.

Requirements:
- 5+ years Python development
- Experience with distributed systems
- Strong understanding of REST APIs and microservices
- Experience with PostgreSQL, Redis
- Kubernetes experience preferred
- Strong communication skills

Responsibilities:
- Design and build high-performance APIs handling millions of requests/day
- Lead technical design reviews
- Mentor junior engineers
- Collaborate with product managers on technical feasibility
"""

SAMPLE_CANDIDATE = """
Jane Doe — 7 years Python experience
Current role: Senior Software Engineer at DataCorp
Skills: Python, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, AWS
Achievements:
- Built API platform handling 5M requests/day
- Led team of 4 engineers
- Reduced API latency by 40%
- Mentored 3 junior engineers
Education: BS Computer Science, UC Berkeley
"""


def run_job_application_crew(job_desc: str, candidate_profile: str) -> str:
    llm = chat_llm(temperature=0.4)
    response = llm.invoke([
        SystemMessage(content="You are a hiring manager and career coach. Create concise, tailored application materials that maximize interview chances."),
        HumanMessage(content=f"""Job description:
{job_desc}

Candidate profile:
{candidate_profile}

Produce:
1. JOB MATCH ANALYSIS with top required skills, culture signals, and keywords to mirror.
2. COVER LETTER in 3 short paragraphs.
3. TOP 5 RESUME BULLETS tailored to the role.
4. 10 LIKELY INTERVIEW QUESTIONS, split into 5 behavioral and 5 technical.
5. NEGOTIATION RANGE ESTIMATE based on seniority, with a note that candidates should verify local market data."""),
    ])
    return response.content


def main():
    parser = argparse.ArgumentParser(description="Job Application Agent")
    parser.add_argument("--job-desc", default=SAMPLE_JOB, help="Job description text")
    parser.add_argument("--candidate", default=SAMPLE_CANDIDATE, help="Candidate profile summary")
    args = parser.parse_args()

    print("\n💼 Preparing job application materials...\n")
    result = run_job_application_crew(args.job_desc, args.candidate)

    print("=" * 60)
    print("📋 JOB APPLICATION PACKAGE")
    print("=" * 60)
    print(result)


if __name__ == "__main__":
    main()
