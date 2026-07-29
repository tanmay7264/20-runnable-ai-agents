#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root_dir"

python_bin="${PYTHON:-python3.13}"
if ! command -v "$python_bin" >/dev/null 2>&1; then
  python_bin="python3"
fi

if [ ! -d .venv ]; then
  "$python_bin" -m venv .venv
fi

. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

cd web
npm install

echo "Setup complete. Run: cd web && npm run dev:ui"
echo "Open http://127.0.0.1:5174/ and enter your Groq API key in the UI."
