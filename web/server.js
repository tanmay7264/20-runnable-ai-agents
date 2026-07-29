import { createServer } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, ".env");
const setupPath = path.join(repoRoot, ".setup.json");
const preferredPython = path.join(repoRoot, ".venv", "bin", "python");
const fallbackPython = path.join(repoRoot, "agents", "19-competitive-analysis-agent", ".venv", "bin", "python");
const pythonPath = existsSync(preferredPython) ? preferredPython : fallbackPython;
const port = Number(process.env.PORT || 5174);

const agentConfigs = {
  "01-web-research-agent": { args: ["query"], steps: ["Receive research topic", "Search web sources", "Summarize evidence", "Return report"] },
  "02-code-review-agent": { args: ["code", "language"], steps: ["Read code", "Check bugs and risks", "Review quality", "Return markdown review"] },
  "03-pdf-qa-agent": { args: ["pdf", "question"], steps: ["Load PDF", "Create local index", "Retrieve context", "Answer question"] },
  "04-sql-query-agent": { args: ["db", "question"], steps: ["Open SQLite database", "Inspect tables", "Generate SQL", "Return answer"] },
  "05-email-drafting-agent": { args: ["context", "tone", "recipient"], steps: ["Analyze context", "Plan email", "Draft response", "Return final email"] },
  "06-news-summarizer-agent": { args: ["topic", "count"], steps: ["Fetch articles", "Extract themes", "Summarize briefing", "Return headlines"] },
  "07-github-issue-triager": { args: ["title", "body"], steps: ["Read issue", "Classify severity", "Suggest labels", "Return triage JSON"] },
  "08-data-analysis-agent": { args: ["file", "question", "allow-dangerous-code"], steps: ["Load data", "Create dataframe agent", "Run analysis code", "Return answer"] },
  "09-resume-parser-agent": { args: ["job-desc"], steps: ["Load sample resume", "Parse candidate profile", "Score job fit", "Return JSON"] },
  "10-meeting-notes-agent": { args: ["text"], steps: ["Read transcript", "Extract decisions", "Find action items", "Return notes"] },
  "11-stock-research-agent": { args: ["ticker"], steps: ["Fetch market data", "Calculate fundamentals", "Analyze risks", "Return investment brief"] },
  "12-travel-planner-agent": { args: ["destination", "days", "budget", "interests"], steps: ["Collect trip goals", "Plan itinerary", "Estimate budget", "Return travel plan"] },
  "13-customer-support-agent": { args: ["message"], steps: ["Retrieve support context", "Check escalation", "Generate answer", "Return response"] },
  "14-social-media-agent": { args: ["topic", "brand", "platforms"], steps: ["Research angle", "Create platform drafts", "Optimize tone", "Return content pack"] },
  "15-unit-test-generator": { args: ["code"], steps: ["Read source code", "Find behavior", "Generate pytest cases", "Return test file"] },
  "16-documentation-writer": { args: ["code", "format"], steps: ["Parse code structure", "Draft README", "Add docstrings", "Return documentation"] },
  "17-recipe-agent": { args: ["ingredients", "diet", "time", "servings"], steps: ["Read pantry items", "Apply constraints", "Create recipe", "Return instructions"] },
  "18-job-application-agent": { args: ["job-desc", "candidate"], steps: ["Read job post", "Profile candidate", "Draft materials", "Return prep pack"] },
  "19-competitive-analysis-agent": { args: ["company", "industry"], steps: ["Identify competitors", "Analyze each rival", "Find gaps", "Return strategy report"] },
  "20-multi-agent-debate": { args: ["topic", "rounds"], steps: ["Create debate agents", "Run arguments", "Judge responses", "Return verdict"] },
};

const defaults = {
  query: "latest advances in AI agents",
  code: "def add(a, b):\n    return a + b",
  language: "python",
  pdf: "sample.pdf",
  question: "What is the key insight?",
  db: "demo.sqlite",
  context: "Follow up after a product demo. The customer was interested but has not replied.",
  tone: "professional and friendly",
  recipient: "a potential client",
  topic: "AI agents in education",
  count: "5",
  title: "Login fails on mobile Safari",
  body: "Users see a blank screen after submitting OTP on iOS.",
  file: "sample_data.csv",
  "allow-dangerous-code": "true",
  "job-desc": "Senior Python developer with API, data, and automation experience.",
  text: "We decided to launch the beta next Friday. Maya owns onboarding, Ravi owns analytics, and Tanmay will prepare the demo.",
  ticker: "AAPL",
  destination: "Tokyo, Japan",
  days: "5",
  budget: "2500",
  interests: "food, culture, history",
  message: "I cannot sync files and I am worried about losing data.",
  brand: "BatchMates",
  platforms: "twitter,linkedin,instagram",
  format: "both",
  ingredients: "chicken breast, garlic, lemon, olive oil, rosemary, potatoes",
  diet: "",
  time: "30",
  servings: "2",
  candidate: "Python engineer with 6 years of backend, FastAPI, data pipelines, and team leadership experience.",
  company: "Nykaa",
  industry: "beauty ecommerce in India",
  rounds: "1",
};

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

async function hasGroqKey() {
  try {
    const env = await fs.readFile(envPath, "utf8");
    return /^GROQ_API_KEY=gsk_[^\s]+/m.test(env);
  } catch {
    return false;
  }
}

async function readSetup() {
  try {
    return JSON.parse(await fs.readFile(setupPath, "utf8"));
  } catch {
    return {};
  }
}

async function writeSetup(patch) {
  const current = await readSetup();
  const next = { ...current, ...patch };
  await fs.writeFile(setupPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

async function saveGroqKey(apiKey) {
  const key = String(apiKey || "").trim();
  if (!/^gsk_[A-Za-z0-9_-]{20,}$/.test(key)) {
    throw new Error("Enter a valid Groq API key. It should start with gsk_.");
  }
  await fs.writeFile(
    envPath,
    [
      "AI_PROVIDER=groq",
      `GROQ_API_KEY=${key}`,
      "GROQ_MODEL=llama-3.3-70b-versatile",
      "GROQ_BASE_URL=https://api.groq.com/openai/v1",
      "",
    ].join("\n"),
    { mode: 0o600 },
  );
  process.env.AI_PROVIDER = "groq";
  process.env.GROQ_API_KEY = key;
  process.env.GROQ_MODEL = "llama-3.3-70b-versatile";
  process.env.GROQ_BASE_URL = "https://api.groq.com/openai/v1";
}

function repoFolderName(repoUrl) {
  const parsed = new URL(repoUrl);
  if (parsed.hostname !== "github.com") throw new Error("Use a GitHub repository URL.");
  const parts = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("Use a full GitHub repository URL like https://github.com/owner/repo.git.");
  return parts[1].replace(/[^A-Za-z0-9._-]/g, "");
}

async function cloneRepo(repoUrl) {
  const url = String(repoUrl || "").trim();
  const folder = repoFolderName(url);
  const target = path.join(path.dirname(repoRoot), folder);
  try {
    await fs.access(target);
    return { target, alreadyExists: true };
  } catch {
    // available
  }
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["clone", url, target], { cwd: path.dirname(repoRoot) });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ target, alreadyExists: false });
      else reject(new Error(stderr || `git clone exited with code ${code}.`));
    });
  });
}

function cliArgs(slug, params = {}) {
  const config = agentConfigs[slug];
  if (!config) throw new Error("Unknown agent.");
  const args = ["agent.py"];
  for (const name of config.args) {
    const value = params[name] ?? defaults[name];
    if (name === "allow-dangerous-code") {
      if (value === true || value === "true") args.push("--allow-dangerous-code");
      continue;
    }
    if (value !== undefined && value !== "") args.push(`--${name}`, String(value));
  }
  return args;
}

function runAgent({ slug, params }) {
  const agentRoot = path.join(repoRoot, "agents", slug);
  if (!existsSync(path.join(agentRoot, "agent.py"))) throw new Error("Agent folder not found.");
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const child = spawn(pythonPath, cliArgs(slug, params), {
      cwd: agentRoot,
      env: { ...process.env, PYTHONPATH: path.join(repoRoot, "agents") },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const durationMs = Date.now() - startedAt;
      if (code === 0) resolve({ output: stdout, durationMs });
      else reject(new Error(stderr || stdout || `Agent exited with code ${code}.`));
    });
  });
}

const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/api/setup-status") {
    const setup = await readSetup();
    sendJson(response, 200, { hasGroqKey: await hasGroqKey(), specialization: setup.specialization || "" });
    return;
  }
  if (request.method === "POST" && request.url === "/api/save-groq-key") {
    try {
      const payload = await readJson(request);
      await saveGroqKey(payload.apiKey);
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }
  if (request.method === "POST" && request.url === "/api/save-specialization") {
    try {
      const payload = await readJson(request);
      const value = String(payload.specialization || "").trim().toLowerCase();
      if (!["finance", "operations", "marketing", "hr"].includes(value)) throw new Error("Choose a specialization.");
      sendJson(response, 200, await writeSetup({ specialization: value }));
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }
  if (request.method === "POST" && request.url === "/api/clone-repo") {
    try {
      sendJson(response, 200, await cloneRepo((await readJson(request)).repoUrl));
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }
  if (request.method === "POST" && request.url === "/api/run-agent") {
    try {
      sendJson(response, 200, await runAgent(await readJson(request)));
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
    return;
  }
  vite.middlewares(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AI Agents UI ready at http://127.0.0.1:${port}/`);
});
