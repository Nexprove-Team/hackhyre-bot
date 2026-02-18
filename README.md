# RemoteOK Job Scraper

A production-grade Node.js web scraper that extracts **REAL, LIVE** job listings
from RemoteOK (formerly AngelList Talent). No mock data. No placeholders. No
simulated responses.

## Features

✅ **Real Data**: Fetches live job listings from RemoteOK's public JSON API  
✅ **Verifiable**: Every job includes a clickable URL to the actual listing  
✅ **Production-Ready**: Comprehensive error handling and validation  
✅ **Rate Limited**: Respects server resources with built-in delays  
✅ **Clean Output**: Structured JSON with metadata and job details  
✅ **Easy to Use**: Simple command-line interface

## Requirements

- Node.js v16.0.0 or higher
- Internet connection

## Installation

```bash
# Clone or navigate to the project directory
cd hackhyre

# Install dependencies
npm install
```

## Usage

### Basic Usage

```bash
node index.js <keyword>
```

**Example:**

```bash
node index.js backend
```

### With Location Filter

```bash
node index.js <keyword> <location>
```

**Example:**

```bash
node index.js frontend USA
node index.js "product manager" Europe
```

### View Help

```bash
node index.js --help
```

## Output

### Console Output

The scraper provides real-time progress updates:

```
╔════════════════════════════════════════════════════════════════╗
║              🚀 RemoteOK Job Scraper v1.0                      ║
╚════════════════════════════════════════════════════════════════╝

📋 Searching for: backend
🔗 API URL: https://remoteok.com/remote-backend-jobs.json

⏳ Fetching jobs from RemoteOK API...
✅ Fetched 98 items from API

🔄 Transforming job data...
   Transformed 97 jobs

✅ Validating data...
   97 valid jobs
   97 unique jobs

💾 Saving results...
✅ Results saved to: output/jobs_backend_2026-02-17T20-01-35-869Z.json

╔════════════════════════════════════════════════════════════════╗
║                      📈 Summary                                ║
╚════════════════════════════════════════════════════════════════╝
   Total jobs found: 97
   Platform: RemoteOK
   Keyword: backend
   Location: Any
   Output file: jobs_backend_2026-02-17T20-01-35-869Z.json

📋 Sample jobs:

   1. Senior Software Engineer AI ML
      Company: ClickHouse
      Location: United States
      URL: https://remoteok.com/remote-jobs/remote-senior-software-engineer-ai-ml-clickhouse-1130326

   ... and 94 more jobs

✨ Scraping completed successfully!
```

### JSON File Output

Results are saved to `output/jobs_<keyword>_<timestamp>.json`:

```json
{
  "metadata": {
    "keyword": "backend",
    "location": "Any",
    "total_jobs": 97,
    "scraped_at": "2026-02-17T20:01:35.869Z",
    "platform": "RemoteOK",
    "version": "1.0.0"
  },
  "jobs": [
    {
      "job_title": "Senior Software Engineer AI ML",
      "company_name": "ClickHouse",
      "platform": "RemoteOK",
      "location": "United States",
      "recruiter_or_contact": null,
      "job_url": "https://remoteok.com/remote-jobs/remote-senior-software-engineer-ai-ml-clickhouse-1130326",
      "company_careers_url": "https://remoteOK.com/remote-jobs/remote-senior-software-engineer-ai-ml-clickhouse-1130326",
      "scraped_at": "2026-02-17T20:01:35.866Z"
    }
  ]
}
```

## Output Format

Each job listing includes the following fields:

| Field                  | Type         | Description                            | Example                                |
| ---------------------- | ------------ | -------------------------------------- | -------------------------------------- |
| `job_title`            | string       | Job position title                     | "Senior Backend Engineer"              |
| `company_name`         | string       | Company name                           | "Acme Corp"                            |
| `platform`             | string       | Job platform (always "RemoteOK")       | "RemoteOK"                             |
| `location`             | string       | Job location                           | "Remote", "USA", "Europe"              |
| `recruiter_or_contact` | null         | Recruiter contact (see limitations)    | `null`                                 |
| `job_url`              | string       | Direct link to job listing             | "https://remoteok.com/remote-jobs/..." |
| `company_careers_url`  | string\|null | Company website/careers page           | "https://company.com" or `null`        |
| `scraped_at`           | string       | ISO timestamp of when data was scraped | "2026-02-17T20:01:35.866Z"             |

## Known Limitations

### 1. No Recruiter Contact Information

**Issue**: RemoteOK (and most job boards) do not display recruiter emails, phone
numbers, or LinkedIn profiles on public pages.

**Impact**: The `recruiter_or_contact` field will **always be `null`**.

**Why**: Contact information is only shared after you apply to a job or create
an account. This is to prevent spam and protect recruiter privacy.

**Workaround**: Users must apply to jobs through the `job_url` to get contact
information.

### 2. Location Filtering

**Issue**: Location filtering is done client-side after fetching all jobs.

**Impact**: May not be as precise as server-side filtering.

**Mitigation**: The scraper filters results based on location keywords in the
job's location field.

### 3. API Availability

**Issue**: This scraper relies on RemoteOK's public JSON API.

**Impact**: If RemoteOK changes or removes their API, the scraper will need
updates.

**Current Status**: Working as of February 2026.

## Technical Details

### Architecture

- **HTTP Client**: axios (for API requests)
- **Data Format**: JSON (RemoteOK provides a public JSON API)
- **No Headless Browser**: Simple HTTP requests only
- **No Authentication**: Public API, no login required
- **No CAPTCHA Bypass**: Uses legitimate public API

### Rate Limiting

The scraper includes built-in rate limiting to respect RemoteOK's servers:

- 2-second delay between requests (configurable)
- Sequential requests only (no concurrent requests)

### Error Handling

Comprehensive error handling for:

- Network failures (timeout, connection refused)
- HTTP errors (404, 500, etc.)
- Invalid data (missing required fields)
- File system errors (permissions, disk space)

## Examples

### Search for Backend Jobs

```bash
node index.js backend
```

**Output**: `output/jobs_backend_2026-02-17T20-01-35-869Z.json`

### Search for Frontend Jobs

```bash
node index.js frontend
```

**Output**: `output/jobs_frontend_2026-02-17T20-02-56-711Z.json`

### Search for Product Manager Jobs in USA

```bash
node index.js "product manager" USA
```

**Output**: `output/jobs_product_manager_2026-02-17T20-02-30-527Z.json`

## Troubleshooting

### No Jobs Found

If you see "No valid jobs found", this could mean:

- No jobs match your search criteria
- The keyword may not have any listings on RemoteOK
- Location filter is too restrictive

**Solution**: Try a different keyword or remove the location filter.

### Network Errors

If you see connection errors:

- Check your internet connection
- Verify RemoteOK is accessible: https://remoteok.com
- Try again in a few minutes (server may be temporarily down)

### Permission Errors

If you see "Permission denied" when saving files:

- Ensure you have write permissions in the project directory
- Check that the `output/` directory is not write-protected

## Project Structure

```
hackhyre/
├── index.js              # Main scraper script
├── package.json          # Dependencies and metadata
├── README.md            # This file
├── .gitignore           # Git ignore rules
├── output/              # Generated JSON files (gitignored)
│   └── jobs_*.json
└── plans/               # Architecture documentation
    ├── job-scraper-architecture.md
    ├── technical-specification.md
    └── README.md
```

## Dependencies

- **axios** (^1.6.0): HTTP client for API requests
- **cheerio** (^1.0.0-rc.12): HTML parser (not used in current version, but
  available for future enhancements)

## Ethical Considerations

This scraper:

- ✅ Uses RemoteOK's **public JSON API** (not scraping HTML)
- ✅ Includes rate limiting to avoid overwhelming servers
- ✅ Respects robots.txt guidelines
- ✅ Does not bypass authentication or CAPTCHA
- ✅ Does not attempt to access private data
- ✅ Is intended for personal job search automation and research

**Not intended for**:

- ❌ Commercial data reselling
- ❌ Overwhelming servers with excessive requests
- ❌ Bypassing platform features or terms of service

## License

MIT

## Contributing

This is a production-grade scraper built for educational and personal use. Feel
free to:

- Report issues
- Suggest improvements
- Fork and modify for your needs

## Support

For questions or issues:

1. Check the [Known Limitations](#known-limitations) section
2. Review the [Troubleshooting](#troubleshooting) guide
3. Check the architecture docs in `plans/` directory

## Changelog

### v1.0.0 (2026-02-17)

- Initial release
- RemoteOK JSON API integration
- Command-line interface
- Location filtering
- Comprehensive error handling
- JSON output with metadata
- Rate limiting

## Future Enhancements (Out of Scope for v1.0)

- [ ] Multi-platform support (Indeed, LinkedIn, etc.)
- [ ] Pagination support for large result sets
- [ ] Database storage (MongoDB, PostgreSQL)
- [ ] REST API endpoint
- [ ] Scheduled scraping with cron jobs
- [ ] Email notifications for new jobs
- [ ] CSV output format
- [ ] Advanced filtering (salary, experience level, etc.)

---

**Built with ❤️ for job seekers**
