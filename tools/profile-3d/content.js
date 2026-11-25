// Everything the images say. Sourced from the 2026 résumé and the portfolio
// (github.com/Lingu17/portfolio, lib/content.ts); test counts are the documented,
// passing results in each repository's README.

export const PROFILE = {
  first: "Lingraj",
  last: "Malipatil",
  role: "Software engineer · AI agents & LLM evaluation",
  lede: "I build AI agents and LLM applications that <em>check their evidence before they act</em> — the signed answer, the page, the commit.",
  facts: [
    ["Now", "AI Model Evaluation Fellow · Handshake AI"],
    ["Built", "Ledgerline · Code Forge AI · Intervexa · Vericore"],
    ["Studied", "B.E. Information Science · CMRIT, 2026"],
  ],
  place: "Bengaluru, India",
};

/** One cube per automated test, grouped by project (backend + frontend/browser suites). */
export const LEDGER = [
  { project: "Ledgerline", count: 651, color: "#c9c9ce" },
  { project: "Intervexa", count: 199, color: "#7c7c83" },
  { project: "Code Forge AI", count: 141, color: "#3c3c42" },
];

export const PROJECTS = {
  ledgerline: {
    no: "01",
    name: "Ledgerline",
    category: "Agent-to-agent payments · Airwallex hackathon 2026",
    headline: ["Ask the payer's agent.", "Verify before money moves."],
    caption: "Signed answer → three checks → a new plan",
    metrics: [
      { value: "651", label: "backend tests in CI" },
      { value: "2,127", label: "payments matched to a reference model" },
      { value: "25/25", label: "scripted attacks refused" },
    ],
    stack: ["Python", "FastAPI", "React", "TypeScript", "MCP", "Claude API", "Google Cloud"],
  },
  codeforge: {
    no: "02",
    name: "Code Forge AI",
    category: "Repository intelligence",
    headline: ["Answers that cite", "the commit."],
    caption: "Tower height = file size · imports at commit 62d8979",
    metrics: [
      { value: "119", label: "backend tests" },
      { value: "22", label: "frontend tests" },
      { value: "RLS", label: "tenant isolation tested in CI" },
    ],
    stack: ["Python", "FastAPI", "Next.js", "PostgreSQL", "pgvector", "Gemini", "Groq"],
  },
  intervexa: {
    no: "03",
    name: "Intervexa",
    category: "Developer tooling",
    headline: ["Two PRs pass.", "Together they fail."],
    caption: "Each passes alone · merged: KeyError 'token'",
    metrics: [
      { value: "185", label: "backend tests" },
      { value: "14", label: "browser workflows" },
      { value: "100/100", label: "acceptance scenarios" },
    ],
    stack: ["Python", "FastAPI", "Next.js", "TypeScript", "PostgreSQL", "React Three Fiber"],
  },
  vericore: {
    no: "04",
    name: "Vericore",
    category: "Document intelligence",
    headline: ["No passage,", "no answer."],
    caption: "Below the threshold, the model is never called",
    metrics: [
      { value: "53", label: "backend tests, incl. account isolation" },
      { value: "0", label: "model calls when no passage qualifies" },
      { value: "3", label: "eval modes: answer · compare · refuse" },
    ],
    stack: ["Python", "FastAPI", "React", "ChromaDB", "Sentence Transformers", "Groq"],
  },
};

export const TOOLKIT = [
  { name: "AI engineering", items: ["AI agents", "MCP", "LLM apps", "RAG", "Embeddings", "Vector search", "Hybrid search", "Prompt engineering", "LLM evaluation", "Rubric design"] },
  { name: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL", "Kotlin"] },
  { name: "Frameworks", items: ["FastAPI", "Flask", "React", "Next.js", "Tailwind CSS", "Three.js / R3F", "Android · Room · WorkManager"] },
  { name: "Data & cloud", items: ["PostgreSQL", "pgvector", "SQLite", "ChromaDB", "Supabase", "Docker", "Google Cloud"] },
  { name: "Quality & security", items: ["pytest", "Playwright", "GitHub Actions", "CI/CD", "OAuth", "JWT", "Row-level security"] },
  { name: "AI tools", items: ["Claude Code", "Cursor", "OpenAI Codex", "Claude API", "Gemini", "Groq"] },
];

export const BUTTONS = {
  portfolio: { label: "Portfolio", icon: "↗", primary: true },
  resume: { label: "Résumé", icon: "↓" },
  linkedin: { label: "LinkedIn", icon: "↗" },
  contact: { label: "Contact", icon: "→" },
};
