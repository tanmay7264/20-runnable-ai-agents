import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Download,
  FileText,
  Github,
  BarChart3,
  Layers3,
  MoonStar,
  Play,
  Search,
  SunMedium,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { catalog, slugify, stripMarkdown } from "./content.js";

const specializations = [
  { id: "finance", label: "Finance", agents: ["04-sql-query-agent", "08-data-analysis-agent", "11-stock-research-agent", "19-competitive-analysis-agent"] },
  { id: "operations", label: "Operations", agents: ["02-code-review-agent", "03-pdf-qa-agent", "07-github-issue-triager", "10-meeting-notes-agent", "12-travel-planner-agent", "13-customer-support-agent", "15-unit-test-generator", "16-documentation-writer", "20-multi-agent-debate"] },
  { id: "marketing", label: "Marketing", agents: ["01-web-research-agent", "05-email-drafting-agent", "06-news-summarizer-agent", "14-social-media-agent", "17-recipe-agent", "19-competitive-analysis-agent"] },
  { id: "hr", label: "HR", agents: ["05-email-drafting-agent", "09-resume-parser-agent", "10-meeting-notes-agent", "18-job-application-agent"] },
];

const fieldLabels = {
  query: "Research query",
  code: "Code snippet",
  language: "Language",
  pdf: "PDF path",
  question: "Question",
  db: "SQLite database path",
  context: "Email context",
  tone: "Tone",
  recipient: "Recipient",
  topic: "Topic",
  count: "Article count",
  title: "Issue title",
  body: "Issue body",
  file: "Data file path",
  "job-desc": "Job description",
  text: "Transcript text",
  ticker: "Ticker",
  destination: "Destination",
  days: "Days",
  budget: "Budget",
  interests: "Interests",
  message: "Customer message",
  brand: "Brand",
  platforms: "Platforms",
  format: "Format",
  ingredients: "Ingredients",
  diet: "Diet",
  time: "Max cooking time",
  servings: "Servings",
  candidate: "Candidate profile",
  company: "Company",
  industry: "Industry",
  rounds: "Rounds",
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

const agentInputs = {
  "01-web-research-agent": ["query"],
  "02-code-review-agent": ["code", "language"],
  "03-pdf-qa-agent": ["pdf", "question"],
  "04-sql-query-agent": ["db", "question"],
  "05-email-drafting-agent": ["context", "tone", "recipient"],
  "06-news-summarizer-agent": ["topic", "count"],
  "07-github-issue-triager": ["title", "body"],
  "08-data-analysis-agent": ["file", "question", "allow-dangerous-code"],
  "09-resume-parser-agent": ["job-desc"],
  "10-meeting-notes-agent": ["text"],
  "11-stock-research-agent": ["ticker"],
  "12-travel-planner-agent": ["destination", "days", "budget", "interests"],
  "13-customer-support-agent": ["message"],
  "14-social-media-agent": ["topic", "brand", "platforms"],
  "15-unit-test-generator": ["code"],
  "16-documentation-writer": ["code", "format"],
  "17-recipe-agent": ["ingredients", "diet", "time", "servings"],
  "18-job-application-agent": ["job-desc", "candidate"],
  "19-competitive-analysis-agent": ["company", "industry"],
  "20-multi-agent-debate": ["topic", "rounds"],
};

const processSteps = {
  langgraph: ["Build typed state", "Enter graph node", "Call model/tool", "Merge state", "Return final state"],
  langchain: ["Collect input", "Build prompt/tool context", "Call model", "Parse result", "Render output"],
  crewai: ["Create specialist agents", "Assign tasks", "Run crew", "Combine work", "Return final artifact"],
  llamaindex: ["Load document", "Index chunks", "Retrieve context", "Ask model", "Return cited answer"],
};

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

function useThemeMode() {
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem("batchmates-theme");
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("batchmates-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

function pathFor(route) {
  return `#${route}`;
}

function titleFromAgent(agent) {
  return agent.title.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function intro(agent) {
  const lines = agent.readme
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("```"));
  return stripMarkdown(lines.find((line) => line.length > 30) || agent.description);
}

function stepsFor(agent) {
  const local = processSteps[slugify(agent.framework)] || processSteps.langchain;
  return local.map((step, index) => ({
    title: step,
    body: [
      `Input enters ${agent.entrypoint}.`,
      `${agent.framework} prepares the execution path.`,
      "Provider config loads from the shared root .env.",
      "Groq receives the prompt or tool result context.",
      "The CLI prints a structured output for the UI.",
    ][index],
  }));
}

function Shell({ setup, onSpecializationChange, children }) {
  const [theme, setTheme] = useThemeMode();
  const active = specializations.find((item) => item.id === setup.specialization);
  const navItems = [{ id: "all", label: "All agents" }, ...specializations];
  return (
    <div className="app-shell">
      <header className="topbar">
        <nav className="topbar-inner" aria-label="Primary navigation">
          <a className="brand" href={pathFor("/")}>
            <img className="brand-mark" src="/images/batchmates-logo-full.webp" alt="BatchMates logo" />
            <span className="brand-copy">
              <span className="brand-title">BatchMates</span>
              <span className="brand-tagline">{active ? `${active.label} workspace` : "AI Agents"}</span>
            </span>
          </a>
          <div className="nav-links">
            <a className="nav-pill" href={pathFor("/create-agent")}>Create your own agent</a>
            {navItems.map((item) =>
              item.id === "all" ? (
                <a className="nav-pill" href={pathFor("/agents")} key={item.id}>{item.label}</a>
              ) : (
                <button
                  className={setup.specialization === item.id ? "nav-pill active" : "nav-pill"}
                  key={item.id}
                  onClick={() => onSpecializationChange(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
          <div className="topbar-actions">
            <label className="theme-switch">
              <input checked={theme === "light"} onChange={(event) => setTheme(event.target.checked ? "light" : "dark")} type="checkbox" />
              <span className="theme-switch-track" aria-hidden="true">
                <MoonStar size={14} />
                <SunMedium size={14} />
                <i />
              </span>
              <span>{theme === "dark" ? "Dark" : "Light"}</span>
            </label>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="creator-footer">
        <strong>Created by Tanmay</strong>
        <span>BatchMates-style AI agents workspace for learning, experimenting, and running practical business agents.</span>
      </footer>
    </div>
  );
}

function SetupScreen({ hasGroqKey, onReady }) {
  const [step, setStep] = useState(hasGroqKey ? "specialization" : "key");
  const [repoUrl, setRepoUrl] = useState("https://github.com/tanmay7264/20-runnable-ai-agents.git");
  const [apiKey, setApiKey] = useState("");
  const [specialization, setSpecialization] = useState("finance");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const saveKey = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/save-groq-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save key.");
      setStep("specialization");
    } catch (keyError) {
      setError(keyError.message);
    } finally {
      setBusy(false);
    }
  };

  const cloneRepo = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/clone-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Clone failed.");
      setMessage(result.alreadyExists ? `Already cloned at ${result.target}` : `Cloned at ${result.target}`);
    } catch (cloneError) {
      setError(cloneError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveSpecialization = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/save-specialization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save specialization.");
      onReady({ hasGroqKey: true, specialization });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="setup-page">
      <section className="setup-hero">
        <p className="eyebrow">First run setup</p>
        <h1>Launch your BatchMates AI agents workspace</h1>
        <p>Clone the repo, save one Groq key into the root .env, then choose a specialization to start with the most relevant agents.</p>
      </section>
      <section className="setup-grid">
        <form className="setup-card" onSubmit={cloneRepo}>
          <div className="setup-card-heading"><Github size={20} /><h2>Clone repository</h2></div>
          <label>GitHub repository URL<input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} /></label>
          <button className="secondary-action" disabled={busy} type="submit"><Download size={17} />Clone it</button>
          {message ? <div className="setup-success">{message}</div> : null}
        </form>

        {step === "key" ? (
          <form className="setup-card primary-setup-card" onSubmit={saveKey}>
            <div className="setup-card-heading"><Zap size={20} /><h2>Groq API key</h2></div>
            <ol className="setup-steps">
              <li>Open console.groq.com and sign in.</li>
              <li>Choose API Keys from the sidebar.</li>
              <li>Create a free key and copy the value starting with gsk_.</li>
              <li>Paste it here and press Enter.</li>
            </ol>
            <label>API key<input autoFocus type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="gsk_..." /></label>
            <button className="primary-action" disabled={busy} type="submit"><CheckCircle2 size={17} />Save key</button>
            {error ? <div className="runner-error">{error}</div> : null}
          </form>
        ) : (
          <section className="setup-card primary-setup-card">
            <div className="setup-card-heading"><Boxes size={20} /><h2>Choose specialization</h2></div>
            <div className="specialization-grid">
              {specializations.map((item) => (
                <button className={specialization === item.id ? "specialization-card active" : "specialization-card"} key={item.id} onClick={() => setSpecialization(item.id)} type="button">
                  <strong>{item.label}</strong>
                  <span>{item.agents.length} matched agents</span>
                </button>
              ))}
            </div>
            <button className="primary-action" disabled={busy} onClick={saveSpecialization} type="button"><ArrowRight size={17} />Open workspace</button>
            {error ? <div className="runner-error">{error}</div> : null}
          </section>
        )}
      </section>
    </main>
  );
}

function Dashboard({ setup }) {
  const active = specializations.find((item) => item.id === setup.specialization) || specializations[0];
  const agents = catalog.agents.filter((agent) => active.agents.includes(agent.slug));
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{active.label} specialization</p>
          <h1>{active.label} agents, ready to run</h1>
          <p>Start with the agents most relevant to your track. Use “All agents” anytime to explore the full set of 20.</p>
          <a className="primary-action" href={pathFor("/agents")}><Boxes size={18} />View all agents</a>
        </div>
        <div className="page-hero-icon"><Workflow size={42} /></div>
      </section>
      <AgentGrid agents={agents} />
    </>
  );
}

function AgentsPage() {
  const [query, setQuery] = useState("");
  const agents = catalog.agents.filter((agent) => {
    const haystack = `${agent.title} ${agent.description} ${agent.framework} ${agent.industry} ${agent.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">All agents</p>
          <h1>Every runnable agent in the repo</h1>
          <p>All 20 agents are wired with backend inputs, process explanations, and output panels.</p>
        </div>
        <div className="page-hero-icon"><Code2 size={42} /></div>
      </section>
      <section className="catalog-toolbar"><label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" /></label></section>
      <AgentGrid agents={agents} />
    </>
  );
}

function CreateAgentPage() {
  const prerequisites = [
    "Python 3.13 and a local virtual environment",
    "One Groq API key saved in the root .env",
    "A clear business problem, target user, and expected output format",
    "Basic comfort with CLI arguments, JSON/Markdown output, and reading logs",
  ];
  const steps = [
    ["Define the job", "Write one sentence for what the agent should do, who it helps, and what result it returns."],
    ["Create the folder", "Add a new numbered folder inside agents with agent.py, README.md, requirements.txt, metadata.yaml, and .env.example."],
    ["Use shared provider", "Import chat_llm, crew_llm, or llama_index_llm from agents/common.py so the agent uses the same Groq key."],
    ["Add inputs", "Expose every user-controlled value as argparse flags so the web UI and terminal can run the same agent."],
    ["Return clean output", "Print a concise Markdown, JSON, or report-style answer that the UI can turn into readable cards."],
    ["Wire the UI", "Add the new slug, input fields, defaults, and process steps in web/src/App.jsx."],
  ];
  const roadmap = [
    "Day 1: choose the use case and design the prompt/output",
    "Day 2: build the smallest terminal agent",
    "Day 3: add tools, files, APIs, or data sources",
    "Day 4: test edge cases and improve errors",
    "Day 5: connect it to the UI and polish the result view",
  ];
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Build with BatchMates</p>
          <h1>Create your own agent</h1>
          <p>Use the same pattern as the 20 runnable agents: one focused Python backend, one shared Groq key, clear CLI inputs, and a UI card that explains what is happening.</p>
        </div>
        <div className="page-hero-icon"><Zap size={42} /></div>
      </section>
      <section className="content-band agent-guide">
        <div className="walkthrough-grid">
          <article className="walk-card">
            <CheckCircle2 size={22} />
            <h3>Prerequisites</h3>
            <ul>{prerequisites.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className="walk-card">
            <Workflow size={22} />
            <h3>Short roadmap</h3>
            <ul>{roadmap.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
        <div className="guide-steps">
          {steps.map(([title, body], index) => (
            <article className="guide-step" key={title}>
              <span>{index + 1}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
        <div className="source-block">
          <strong>Starter command</strong>
          <code>mkdir agents/21-my-agent && touch agents/21-my-agent/agent.py agents/21-my-agent/README.md agents/21-my-agent/requirements.txt agents/21-my-agent/metadata.yaml</code>
          <span>Keep the first version boring: parse inputs, call the shared LLM helper, print one useful answer, then wire it into the UI.</span>
        </div>
      </section>
    </>
  );
}

function AgentGrid({ agents }) {
  return (
    <section className="content-band">
      <div className="card-grid">
        {agents.map((agent) => <AgentCard agent={agent} key={agent.id} />)}
      </div>
    </section>
  );
}

function AgentCard({ agent }) {
  return (
    <a className="agent-card" href={pathFor(`/agents/${agent.slug}`)}>
      <div className="card-topline"><span className={`framework-pill ${slugify(agent.framework)}`}>{agent.framework}</span><small>{agent.difficulty}</small></div>
      <h3>{titleFromAgent(agent)}</h3>
      <p>{agent.description}</p>
      <div className="tag-list">{[agent.industry, ...agent.tags].filter(Boolean).slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
    </a>
  );
}

function AgentPage({ agent }) {
  const [output, setOutput] = useState("");
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{agent.framework} backend flow</p>
          <h1>{titleFromAgent(agent)}</h1>
          <p>{agent.description}</p>
        </div>
        <div className="page-hero-icon"><Layers3 size={42} /></div>
      </section>
      <section className="detail-layout">
        <aside className="detail-aside">
          <MetadataPanel agent={agent} />
          <h2>Backend pipeline</h2>
          <ProcessAnimation agent={agent} active={false} />
        </aside>
        <article className="detail-main">
          <section className="explain-panel">
            <h2>How this agent works</h2>
            <p>{intro(agent)}</p>
            <ul className="check-list">
              {stepsFor(agent).map((step) => (
                <li key={step.title}><CheckCircle2 size={16} /> <span><strong>{step.title}:</strong> {step.body}</span></li>
              ))}
            </ul>
          </section>
          <RunPanel agent={agent} onOutput={setOutput} />
          <section className="explain-panel">
            <h2>How output is displayed</h2>
            <p>The backend runs the Python CLI in the selected agent folder, captures stdout, and prints the final markdown or JSON into the output panel below.</p>
          </section>
          {output ? <OutputPanel output={output} /> : null}
          <CodeBlock code={agent.code} />
        </article>
      </section>
    </>
  );
}

function MetadataPanel({ agent }) {
  const rows = [["Path", agent.localPath], ["Framework", agent.framework], ["Difficulty", agent.difficulty], ["Industry", agent.industry], ["Model", "Groq default"], ["Entrypoint", agent.entrypoint]];
  return <section className="metadata-panel"><h2>Agent details</h2>{rows.map(([label, value]) => <div className="meta-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>;
}

function ProcessAnimation({ agent, active, current = 0 }) {
  const steps = stepsFor(agent);
  return (
    <div className={active ? "process-lane running" : "process-lane"}>
      <div className="agent-orbit" aria-hidden="true">
        <div className="pipeline-stage">
          <div className="pipeline-dock input-dock">Input</div>
          <div className="pipeline-dock output-dock">Output</div>
          <div className="pipeline-rail" />
          <div className="agent-cube">
            <span className="cube-face cube-front"><Workflow size={26} /></span>
            <span className="cube-face cube-top" />
            <span className="cube-face cube-side" />
          </div>
          <span className="data-packet" style={{ "--progress": `${steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100}%` }} />
          {steps.map((step, index) => (
            <span
              className={index === current ? "pipeline-node active" : index < current ? "pipeline-node done" : "pipeline-node"}
              key={step.title}
              style={{ "--x": `${steps.length > 1 ? (index / (steps.length - 1)) * 100 : 50}%` }}
            >
              {index + 1}
            </span>
          ))}
        </div>
        <p>{active ? `Running ${steps[current]?.title || "agent task"}` : "Backend task flow"}</p>
      </div>
      <div className="process-steps">
        {steps.map((step, index) => (
          <div className={index <= current ? "process-step active" : "process-step"} key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunPanel({ agent, onOutput }) {
  const fields = agentInputs[agent.slug] || [];
  const [params, setParams] = useState(() => Object.fromEntries(fields.map((field) => [field, defaults[field] || ""])));
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => {
      setCurrentStep((value) => Math.min(value + 1, stepsFor(agent).length - 1));
    }, 900);
    return () => window.clearInterval(timer);
  }, [agent, isRunning]);

  const run = async (event) => {
    event.preventDefault();
    setIsRunning(true);
    setCurrentStep(0);
    setError("");
    onOutput("");
    try {
      const response = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: agent.slug, params }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Agent run failed.");
      setCurrentStep(stepsFor(agent).length - 1);
      onOutput(result.output || "Agent completed without output.");
    } catch (runError) {
      setError(runError.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="runner-panel">
      <div className="runner-heading"><div><p className="eyebrow">Run backend</p><h2>Try this agent</h2></div><span>{isRunning ? "Processing" : "Ready"}</span></div>
      <ProcessAnimation agent={agent} active={isRunning} current={currentStep} />
      <form className="runner-form dynamic-runner-form" onSubmit={run}>
        {fields.map((field) => {
          const large = ["code", "body", "context", "text", "job-desc", "candidate", "message"].includes(field);
          return (
            <label className={large ? "wide-field" : ""} key={field}>
              {fieldLabels[field] || field}
              {field === "allow-dangerous-code" ? (
                <select value={params[field]} onChange={(event) => setParams({ ...params, [field]: event.target.value })}><option value="true">Enabled for demo</option><option value="false">Disabled</option></select>
              ) : large ? (
                <textarea value={params[field]} onChange={(event) => setParams({ ...params, [field]: event.target.value })} />
              ) : (
                <input value={params[field]} onChange={(event) => setParams({ ...params, [field]: event.target.value })} />
              )}
            </label>
          );
        })}
        <button className="primary-action" disabled={isRunning} type="submit"><Play size={18} />{isRunning ? "Running agent" : "Run agent"}</button>
      </form>
      {error ? <div className="runner-error">{error}</div> : null}
    </section>
  );
}

function OutputPanel({ output }) {
  const report = useMemo(() => buildOutputReport(output), [output]);
  return (
    <section className="output-report">
      <div className="report-heading">
        <div>
          <p className="eyebrow">Agent result</p>
          <h2>{report.title}</h2>
        </div>
        <span>{report.kind}</span>
      </div>
      {report.metrics.length ? <div className="metric-grid">{report.metrics.map((item) => <div className="metric-card" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div> : null}
      {report.summary ? <div className="summary-card">{report.summary}</div> : null}
      {report.highlights.length ? <div className="insight-list">{report.highlights.map((item) => <p key={item}>{item}</p>)}</div> : null}
      {report.chart.length ? (
        <div className="mini-chart">
          <div className="chart-title"><BarChart3 size={16} />Detected numeric insights</div>
          {report.chart.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><i style={{ width: `${item.percent}%` }} /><strong>{item.value}</strong></div>)}
        </div>
      ) : null}
      <details className="raw-output">
        <summary><Terminal size={15} />View raw terminal output</summary>
        <pre>{output}</pre>
      </details>
    </section>
  );
}

function buildOutputReport(output = "") {
  const cleanLine = (line) => line.replace(/[✅❓📊📋🏗️✉️⚠️💬]/g, "").replace(/^[-=\s]+$/, "").trim();
  const lines = output.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const loaded = lines.find((line) => /^Loaded:/i.test(line));
  const columns = lines.find((line) => /^Columns:/i.test(line));
  const question = lines.find((line) => /^Question:/i.test(line));
  const answerLine = lines.find((line) => /^(Answer|Agent):/i.test(line));
  const answer = answerLine ? answerLine.replace(/^(Answer|Agent):\s*/i, "") : lines.filter((line) => !/^(Loaded|Columns|Question):/i.test(line)).join("\n");
  const numbers = Array.from(output.matchAll(/(?:^|[\s:$])(-?\d[\d,]*(?:\.\d+)?)(?:%|[a-zA-Z]*)?/gm)).map((match) => match[1]).slice(0, 4);
  const rowMatch = loaded?.match(/\((\d+)\s+rows\s+×\s+(\d+)\s+columns\)/i);
  const metrics = [
    rowMatch && { label: "Rows analyzed", value: rowMatch[1] },
    rowMatch && { label: "Columns", value: rowMatch[2] },
    numbers[0] && !rowMatch && { label: "Primary number", value: numbers[0] },
  ].filter(Boolean);
  const highlights = answer
    .split(/\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter((item) => item.length > 12)
    .slice(0, 5);
  const chartRaw = lines
    .map((line) => line.match(/^([^:|]{2,34})[:|]\s*\$?(-?\d[\d,]*(?:\.\d+)?)/))
    .filter(Boolean)
    .map((match) => ({ label: match[1].trim(), raw: Number(match[2].replace(/,/g, "")), value: match[2] }))
    .filter((item) => Number.isFinite(item.raw))
    .slice(0, 6);
  const max = Math.max(...chartRaw.map((item) => Math.abs(item.raw)), 1);
  return {
    title: question ? question.replace(/^Question:\s*/i, "") : "Readable output",
    kind: loaded ? "Data report" : "Formatted result",
    summary: answer || lines[0] || "",
    highlights,
    metrics,
    chart: chartRaw.map((item) => ({ ...item, percent: Math.max(8, (Math.abs(item.raw) / max) * 100) })),
    columns,
  };
}

function CodeBlock({ code }) {
  return <div className="code-block"><div className="code-toolbar"><span><FileText size={15} />agent.py</span></div><pre><code>{code}</code></pre></div>;
}

function App() {
  const route = useHashRoute();
  const [setup, setSetup] = useState(null);
  const slug = route.split("/").filter(Boolean)[1];

  useEffect(() => {
    fetch("/api/setup-status")
      .then((response) => response.json())
      .then((result) => setSetup(result))
      .catch(() => setSetup({ hasGroqKey: true, specialization: "finance" }));
  }, []);

  const changeSpecialization = async (specialization) => {
    setSetup((current) => ({ ...current, specialization }));
    window.location.hash = "#/";
    fetch("/api/save-specialization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialization }),
    }).catch(() => {});
  };

  if (!setup) return <div className="setup-loading">Loading setup...</div>;
  if (!setup.hasGroqKey || !setup.specialization) {
    return <SetupScreen hasGroqKey={setup.hasGroqKey} onReady={setSetup} />;
  }

  const agent = catalog.agents.find((item) => item.slug === slug);
  let page = <Dashboard setup={setup} />;
  if (route === "/agents") page = <AgentsPage />;
  if (route === "/create-agent") page = <CreateAgentPage />;
  if (route.startsWith("/agents/")) page = agent ? <AgentPage agent={agent} /> : <AgentsPage />;

  return <Shell setup={setup} onSpecializationChange={changeSpecialization}>{page}</Shell>;
}

export default App;
