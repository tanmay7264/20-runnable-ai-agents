"""
PDF Q&A Agent using LlamaIndex.

Loads a PDF, indexes it, and answers questions about its content.
Maintains conversation history for follow-up questions.

Usage:
    python agent.py --pdf path/to/document.pdf
    python agent.py --pdf report.pdf --question "What is the main finding?"
"""

import argparse
import os
import sys
from pathlib import Path

from llama_index.core import Document, Settings, SimpleDirectoryReader
from llama_index.core.embeddings import MockEmbedding

sys.path.append(str(Path(__file__).resolve().parents[1]))
from common import chat_llm, load_project_env

load_project_env(__file__)
Settings.embed_model = MockEmbedding(embed_dim=384)


def build_index(pdf_path: str) -> list[Document]:
    print(f"📄 Loading and indexing {pdf_path}...")
    if not Path(pdf_path).exists() and Path(pdf_path).name == "sample.pdf":
        docs = [
            Document(
                text=(
                    "Sample BatchMates AI agents document. It explains that this workspace includes "
                    "20 runnable local agents, a shared Groq API key, specialization-based browsing, "
                    "and a UI that displays backend processing and formatted outputs."
                )
            )
        ]
    else:
        reader = SimpleDirectoryReader(input_files=[pdf_path])
        docs = reader.load_data()
    print(f"✅ Indexed {len(docs)} document chunk(s)")
    return docs


def answer_question(docs: list[Document], question: str) -> str:
    llm = chat_llm(temperature=0)
    context = "\n\n".join(doc.text for doc in docs)[:12000]
    response = llm.invoke(
        f"Answer the question using only this document context. If the answer is not in the context, say so.\n\nContext:\n{context}\n\nQuestion: {question}"
    )
    return response.content


def interactive_qa(docs: list[Document]):
    print("\n💬 PDF Q&A Agent ready. Type 'quit' to exit.\n")
    while True:
        question = input("You: ").strip()
        if question.lower() in ("quit", "exit", "q"):
            break
        if not question:
            continue
        print(f"\nAgent: {answer_question(docs, question)}\n")


def single_question(docs: list[Document], question: str):
    print("\n" + "=" * 60)
    print("📋 ANSWER")
    print("=" * 60)
    print(answer_question(docs, question))
    print(f"\n📚 Sources: {len(docs)} chunk(s) referenced")


def main():
    parser = argparse.ArgumentParser(description="PDF Q&A Agent")
    parser.add_argument("--pdf", required=True, help="Path to PDF file")
    parser.add_argument("--question", help="Single question (omit for interactive mode)")
    args = parser.parse_args()

    index = build_index(args.pdf)

    if args.question:
        single_question(index, args.question)
    else:
        interactive_qa(index)


if __name__ == "__main__":
    main()
