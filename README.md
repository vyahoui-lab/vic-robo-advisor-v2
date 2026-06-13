# VIC Robo Advisor

**Vic Investment Club · AI-powered portfolio advisor**

A Next.js app that generates personalised portfolio plans with real ETFs, valid ISINs, TER costs, and full cost transparency — for Swiss or international investors.

## Features
- 8-question intake: age, income, goal, **investment style** (Tech/ESG/Value/Dividend/Balanced/EM), **market scope** (Swiss/International/Mixed), horizon, risk
- AI-generated plans with real ISIN codes, TER, exchange listing, allocation rationale
- Biased vs. Transparent mode comparison (ethics demonstration)
- LinkedIn-style dashboard UI with VIC branding

## Setup

```bash
cp .env.example .env.local
# Fill in your API key
npm install
npm run dev
```

Open http://localhost:3000

## Environment
- `OPENAI_API_KEY` — your LLM API key (DeepSeek, OpenAI, or Anthropic-compatible)
- `OPENAI_BASE_URL` — optional base URL override
- `OPENAI_MODEL` — optional model name override

## Stack
Next.js 15 · TypeScript · Tailwind CSS · DM Sans
