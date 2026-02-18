# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HackHyre is a Node.js CLI job scraper that fetches real job listings from RemoteOK's public JSON API. Single-file implementation in `index.js` (~550 lines). Outputs structured JSON to `output/`.

## Commands

```bash
# Install dependencies
npm install

# Run scraper with a keyword
node index.js <keyword>
node index.js backend
node index.js frontend USA
node index.js "product manager" Europe

# Show help
node index.js --help

# npm test just runs: node index.js backend
npm test
```

There is no build step, linter, or automated test suite. The project has no formal test framework — validation is done by running the scraper and checking output files.

## Architecture

The entire application lives in `index.js` with this flow:

1. **CLI parsing** — extracts keyword and optional location from `process.argv`
2. **URL construction** — converts keyword to `https://remoteok.com/api?tag=<keyword>` JSON endpoint
3. **HTTP fetch** — axios GET with rate limiting (2s delay), 30s timeout, browser-like User-Agent
4. **Data transformation** — `transformJob()` maps RemoteOK API fields to standardized output schema
5. **Post-processing** — client-side location filtering, validation, deduplication
6. **File output** — writes `output/jobs_<keyword>_<timestamp>.json` with metadata header

Key config constants are in the `CONFIG` object at the top of `index.js`.

The module exports `buildSearchUrl`, `transformJob`, `validateJob`, and `filterByLocation` for potential reuse.

## Output Schema

Each output JSON file contains `metadata` (keyword, location, total_jobs, scraped_at, platform, version) and a `jobs` array where each job has: `job_title`, `company_name`, `platform`, `location`, `recruiter_or_contact` (always null — not available from API), `job_url`, `company_careers_url`, `scraped_at`.

## Dependencies

- **axios** — HTTP client for API requests
- **cheerio** — declared but not actively used in current version (API returns JSON directly)

Requires Node.js >= 16.0.0.

## Key Files

- `index.js` — entire application
- `plans/` — architecture docs, technical spec, and HTML structure screenshot used during planning
- `output/` — generated JSON results (gitignored)

## Conventions

- Commit messages use conventional format: `feat:`, `fix:`, etc.
- Branch naming: `feat/your-feature-name`
- The scraper respects rate limits (2-second delays between requests) — do not remove this.
