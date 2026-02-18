# Job Scraper Implementation Plan

## Overview

This document outlines the complete plan for building a production-grade web
scraper that extracts REAL job listings from RemoteOK.

## Project Status

**Phase**: Architecture & Planning Complete **Next Step**: Implementation
(switch to Code mode)

## Documents in This Directory

### 1. [`job-scraper-architecture.md`](./job-scraper-architecture.md)

High-level architecture document covering:

- Project overview and goals
- Technical stack decisions
- Core components breakdown
- Workflow diagrams
- Error handling strategy
- Rate limiting and ethics
- Known limitations
- Success criteria

### 2. [`technical-specification.md`](./technical-specification.md)

Detailed technical specifications including:

- RemoteOK HTML structure analysis
- CSS selector strategies
- Complete code implementations for each component
- Data extraction logic
- Validation rules
- Error handling scenarios
- Testing checklist
- Performance considerations

### 3. [`remoteok-structure.png`](./remoteok-structure.png)

Screenshot of RemoteOK job listings page showing the HTML structure for
reference.

## Key Decisions Made

### Platform Selection

**Chosen**: RemoteOK (https://remoteok.com)

**Reasons**:

- ✅ No CAPTCHA protection (unlike Wellfound/AngelList)
- ✅ Public job listings accessible via HTTP
- ✅ Clean HTML structure suitable for cheerio parsing
- ✅ No authentication required
- ✅ Stable URL patterns

**Trade-off**: Recruiter contact information is NOT publicly visible on RemoteOK
(or most job boards). The `recruiter_or_contact` field will always be `null`.

### Technology Stack

- **Node.js**: Runtime environment
- **axios**: HTTP client for fetching pages
- **cheerio**: HTML parsing (jQuery-like syntax)
- **No headless browsers**: Keeps it simple and fast

### Output Format

```json
{
  "metadata": {
    "keyword": "backend",
    "location": "Any",
    "total_jobs": 25,
    "scraped_at": "2026-02-17T19:45:00.000Z",
    "platform": "RemoteOK"
  },
  "jobs": [
    {
      "job_title": "Backend Engineer",
      "company_name": "Acme Corp",
      "platform": "RemoteOK",
      "location": "Remote / USA",
      "recruiter_or_contact": null,
      "job_url": "https://remoteok.com/remote-jobs/123456",
      "company_careers_url": "https://acme.com/careers",
      "scraped_at": "2026-02-17T19:45:00.000Z"
    }
  ]
}
```

## Implementation Checklist

### Phase 1: Project Setup

- [ ] Create `package.json` with dependencies
- [ ] Install axios and cheerio
- [ ] Create output directory structure
- [ ] Set up .gitignore

### Phase 2: Core Scraper

- [ ] Implement command-line argument parsing
- [ ] Build URL construction function
- [ ] Create HTTP request handler with headers
- [ ] Implement HTML parsing with cheerio
- [ ] Extract job data from listings
- [ ] Add data validation

### Phase 3: Features

- [ ] Add rate limiting (2-3 second delays)
- [ ] Implement error handling
- [ ] Create JSON output writer
- [ ] Add console logging

### Phase 4: Documentation & Testing

- [ ] Write README.md with usage instructions
- [ ] Document known limitations
- [ ] Test with multiple keywords
- [ ] Verify output format
- [ ] Test error scenarios

## File Structure (To Be Created)

```
hackhyre/
├── index.js                 # Main scraper script
├── package.json            # Dependencies
├── README.md              # User-facing documentation
├── .gitignore             # Ignore node_modules, output/
├── output/                # Generated JSON files (gitignored)
│   └── jobs_*.json
└── plans/                 # Architecture docs (current directory)
    ├── job-scraper-architecture.md
    ├── technical-specification.md
    ├── README.md (this file)
    └── remoteok-structure.png
```

## Usage (After Implementation)

### Installation

```bash
cd hackhyre
npm install
```

### Running the Scraper

```bash
# Basic usage
node index.js backend

# With location filter (if supported)
node index.js "product manager" USA

# View help
node index.js --help
```

### Expected Output

```
🚀 RemoteOK Job Scraper v1.0

📋 Searching for: backend
📍 Location: Any

🔗 URL: https://remoteok.com/remote-backend-jobs

⏳ Fetching job listings...
🔍 Parsing HTML...
✅ Validating data...

📊 Found 25 valid jobs

✅ Results saved to: output/jobs_backend_2026-02-17T19-45-00-000Z.json

📈 Summary:
   Total jobs found: 25
   Platform: RemoteOK
   Output file: output/jobs_backend_2026-02-17T19-45-00-000Z.json

✨ Scraping completed successfully!
```

## Known Limitations

### 1. No Recruiter Contact Information

**Issue**: RemoteOK (and most job boards) don't display recruiter emails, phone
numbers, or LinkedIn profiles on public pages.

**Impact**: The `recruiter_or_contact` field will always be `null`.

**Workaround**: Users would need to apply to jobs to get contact information.

### 2. Single Page Scraping

**Issue**: Initial version only scrapes the first page of results.

**Impact**: May miss jobs if there are many results.

**Future Enhancement**: Add pagination support.

### 3. Location Filtering

**Issue**: RemoteOK's location filtering may be limited by URL structure.

**Impact**: Location parameter may not work as expected.

**Mitigation**: Document actual behavior after testing.

### 4. HTML Structure Changes

**Issue**: RemoteOK can change their HTML structure at any time.

**Impact**: Scraper may break and need updates.

**Mitigation**: Use flexible selectors and comprehensive error handling.

## Ethical Considerations

### Respecting the Platform

- ✅ Rate limiting (2-3 second delays between requests)
- ✅ Descriptive User-Agent identifying the scraper
- ✅ No overwhelming the server with concurrent requests
- ✅ Public pages only (no authentication bypass)
- ✅ No CAPTCHA circumvention

### robots.txt Compliance

**Action Required**: Check RemoteOK's robots.txt before deployment

- URL: https://remoteok.com/robots.txt
- Document findings
- Respect any disallowed paths

### Use Case

This scraper is intended for:

- Educational purposes
- Personal job search automation
- Research and analysis

**NOT intended for**:

- Commercial data reselling
- Overwhelming the server
- Bypassing platform features

## Next Steps

### For Implementation (Code Mode)

1. Switch to Code mode
2. Create `package.json` with dependencies
3. Implement `index.js` following technical specification
4. Test with real keywords
5. Create user-facing README.md
6. Verify all requirements are met

### Testing Plan

1. **Functional Tests**:

   - Run with keyword "backend"
   - Run with keyword "frontend"
   - Run with keyword "product manager"
   - Verify JSON output structure
   - Check all URLs are clickable

2. **Error Tests**:

   - Invalid keyword
   - Network timeout (disconnect internet)
   - Invalid HTML (mock response)

3. **Edge Cases**:
   - Empty results
   - Special characters in keyword
   - Very long keywords

## Success Criteria

The scraper will be considered complete when:

✅ Runs successfully with `node index.js <keyword>` ✅ Fetches REAL job data
from RemoteOK ✅ Outputs valid JSON file with correct structure ✅ Includes all
required fields (even if some are null) ✅ Implements rate limiting (2-3 second
delays) ✅ Has comprehensive error handling ✅ Logs progress to console ✅
Includes README with usage instructions ✅ Documents limitation: no recruiter
contacts ✅ All job URLs are clickable and valid ✅ No mock data or placeholders

## Questions for Review

Before proceeding to implementation, please confirm:

1. **Platform**: Is RemoteOK acceptable given the recruiter contact limitation?
2. **Output Format**: Does the JSON structure meet your needs?
3. **Rate Limiting**: Is 2-3 seconds between requests acceptable?
4. **Scope**: Is single-page scraping sufficient for v0, or do you need
   pagination?
5. **Location Filtering**: Is this a critical feature, or can it be
   optional/future enhancement?

## Estimated Complexity

**Components**:

- ✅ Simple: Command-line parsing, URL construction, rate limiting
- ✅ Moderate: HTTP requests, HTML parsing, data extraction
- ✅ Moderate: Error handling, validation, file output
- ⚠️ Unknown: RemoteOK's exact HTML structure (will be discovered during
  implementation)

**Risk Areas**:

- HTML structure may differ from assumptions
- Location filtering may not be straightforward
- Some jobs may have missing data fields

**Mitigation**:

- Flexible CSS selectors
- Comprehensive error handling
- Graceful degradation for missing fields

## Contact & Support

For questions or clarifications during implementation:

- Refer to [`technical-specification.md`](./technical-specification.md) for code
  examples
- Check [`job-scraper-architecture.md`](./job-scraper-architecture.md) for
  design decisions
- Review [`remoteok-structure.png`](./remoteok-structure.png) for HTML structure

---

**Ready for Implementation**: Yes ✅ **Next Action**: Switch to Code mode to
begin building the scraper
