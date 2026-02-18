# Technical Specification: RemoteOK Job Scraper

## RemoteOK HTML Structure Analysis

Based on research of https://remoteok.com/remote-backend-jobs, here's the
structure:

### Page Structure

- **URL Pattern**: `https://remoteok.com/remote-{keyword}-jobs`
- **Job Listings**: Displayed as table rows or card elements
- **Pagination**: May exist for large result sets

### Job Card Elements (Observed)

Each job listing contains:

1. **Company Logo**: Image element
2. **Job Title**: Text heading (e.g., "Software Engineer I")
3. **Company Name**: Text (e.g., "Bloomreach")
4. **Location**: Text (e.g., "India", "United States")
5. **Tags**: Multiple badge elements (e.g., "Software", "Design", "System")
6. **Posted Time**: Relative time (e.g., "16h", "1d")
7. **Premium Badge**: Optional "Upgrade to Premium" indicator

### CSS Selectors Strategy

Based on typical RemoteOK structure (to be verified during implementation):

```javascript
// Job listing container
const jobSelector = "tr.job, .job";

// Within each job:
const selectors = {
  title: 'h2, .title, [itemprop="title"]',
  company: '.company, [itemprop="name"]',
  location: '.location, [itemprop="jobLocation"]',
  url: 'a.preventLink, a[href*="/remote-jobs/"]',
  tags: ".tags .tag, .tag",
  posted: ".time, .posted",
};
```

### Data Extraction Strategy

#### 1. Job Title

- **Selector**: `h2` or `.title` within job element
- **Extraction**: `.text().trim()`
- **Example**: "Software Engineer I"

#### 2. Company Name

- **Selector**: `.company` or company link text
- **Extraction**: `.text().trim()`
- **Example**: "Bloomreach"

#### 3. Location

- **Selector**: `.location` or location text element
- **Extraction**: `.text().trim()`
- **Fallback**: "Remote" if not specified
- **Example**: "India", "United States", "Remote"

#### 4. Job URL

- **Selector**: Main job link `a` element
- **Extraction**: `.attr('href')`
- **Processing**: Convert relative to absolute URL
- **Example**:
  `https://remoteok.com/remote-jobs/123456-software-engineer-i-bloomreach`

#### 5. Company Careers URL

- **Strategy**:
  - Look for company profile link
  - Extract company website if available
  - Otherwise set to `null`
- **Note**: May require clicking into job detail page

#### 6. Platform

- **Value**: Hardcoded as "RemoteOK"

#### 7. Recruiter/Contact

- **Value**: Always `null` (not publicly available)

#### 8. Scraped At

- **Value**: `new Date().toISOString()`

## Implementation Details

### 1. URL Construction

```javascript
function buildSearchUrl(keyword, location = null) {
  const baseUrl = "https://remoteok.com";
  const searchPath = `/remote-${keyword
    .toLowerCase()
    .replace(/\s+/g, "-")}-jobs`;

  let url = baseUrl + searchPath;

  // Location filtering may require query params or different URL structure
  if (location) {
    // To be determined based on RemoteOK's URL structure
    // Possible: ?location=USA or /remote-backend-jobs-usa
  }

  return url;
}
```

### 2. HTTP Request Configuration

```javascript
const axios = require("axios");

const requestConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
  },
  timeout: 30000, // 30 seconds
  maxRedirects: 5,
};

async function fetchPage(url) {
  try {
    const response = await axios.get(url, requestConfig);
    return response.data;
  } catch (error) {
    throw new Error(`HTTP request failed: ${error.message}`);
  }
}
```

### 3. HTML Parsing with Cheerio

```javascript
const cheerio = require("cheerio");

function parseJobListings(html) {
  const $ = cheerio.load(html);
  const jobs = [];

  // Find all job listings
  $("tr.job, .job").each((index, element) => {
    const job = extractJobData($, element);
    if (job) {
      jobs.push(job);
    }
  });

  return jobs;
}

function extractJobData($, element) {
  const $job = $(element);

  // Extract job title
  const title = $job.find("h2, .title").first().text().trim();

  // Extract company name
  const company = $job.find(".company, .company-name").first().text().trim();

  // Extract location
  const location = $job.find(".location").first().text().trim() || "Remote";

  // Extract job URL
  const relativeUrl = $job
    .find('a[href*="/remote-jobs/"]')
    .first()
    .attr("href");
  const jobUrl = relativeUrl ? `https://remoteok.com${relativeUrl}` : null;

  // Extract company website (if available)
  const companyUrl =
    $job.find('.company-link, a[href*="http"]').attr("href") || null;

  return {
    job_title: title,
    company_name: company,
    platform: "RemoteOK",
    location: location,
    recruiter_or_contact: null,
    job_url: jobUrl,
    company_careers_url: companyUrl,
    scraped_at: new Date().toISOString(),
  };
}
```

### 4. Data Validation

```javascript
function validateJob(job) {
  // Required fields
  if (!job.job_title || job.job_title.trim() === "") {
    return false;
  }

  if (!job.company_name || job.company_name.trim() === "") {
    return false;
  }

  if (!job.job_url || !isValidUrl(job.job_url)) {
    return false;
  }

  // Optional fields can be null
  return true;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
```

### 5. Rate Limiting

```javascript
const DELAY_MS = 2000; // 2 seconds between requests

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeWithRateLimit(urls) {
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    console.log(`Fetching ${i + 1}/${urls.length}...`);

    const html = await fetchPage(urls[i]);
    const jobs = parseJobListings(html);
    results.push(...jobs);

    // Add delay between requests (except for last one)
    if (i < urls.length - 1) {
      await delay(DELAY_MS);
    }
  }

  return results;
}
```

### 6. Output File Generation

```javascript
const fs = require("fs");
const path = require("path");

function saveResults(jobs, keyword, location) {
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `jobs_${keyword}_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  // Prepare output data
  const output = {
    metadata: {
      keyword: keyword,
      location: location || "Any",
      total_jobs: jobs.length,
      scraped_at: new Date().toISOString(),
      platform: "RemoteOK",
    },
    jobs: jobs,
  };

  // Write to file with pretty printing
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), "utf8");

  console.log(`\n✅ Results saved to: ${filepath}`);
  return filepath;
}
```

### 7. Command-Line Interface

```javascript
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  const keyword = args[0];
  const location = args[1] || null;

  return { keyword, location };
}

function printHelp() {
  console.log(`
Usage: node index.js <keyword> [location]

Arguments:
  keyword     Job search term (required)
              Examples: "backend", "frontend", "product manager"
  
  location    Location filter (optional)
              Examples: "USA", "Europe", "Remote"

Examples:
  node index.js backend
  node index.js "product manager" USA
  node index.js frontend Europe

Output:
  - Console: Progress logs and summary
  - File: output/jobs_<keyword>_<timestamp>.json
  `);
}
```

### 8. Main Execution Flow

```javascript
async function main() {
  try {
    console.log("🚀 RemoteOK Job Scraper v1.0\n");

    // Parse command-line arguments
    const { keyword, location } = parseArguments();

    console.log(`📋 Searching for: ${keyword}`);
    if (location) {
      console.log(`📍 Location: ${location}`);
    }
    console.log("");

    // Build search URL
    const url = buildSearchUrl(keyword, location);
    console.log(`🔗 URL: ${url}\n`);

    // Fetch and parse
    console.log("⏳ Fetching job listings...");
    const html = await fetchPage(url);

    console.log("🔍 Parsing HTML...");
    const jobs = parseJobListings(html);

    // Validate jobs
    console.log("✅ Validating data...");
    const validJobs = jobs.filter(validateJob);

    console.log(`\n📊 Found ${validJobs.length} valid jobs`);

    // Save results
    const filepath = saveResults(validJobs, keyword, location);

    // Print summary
    console.log("\n📈 Summary:");
    console.log(`   Total jobs found: ${validJobs.length}`);
    console.log(`   Platform: RemoteOK`);
    console.log(`   Output file: ${filepath}`);

    console.log("\n✨ Scraping completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Run the scraper
main();
```

## Error Handling Scenarios

### 1. Network Errors

```javascript
try {
  const response = await axios.get(url, requestConfig);
  return response.data;
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    throw new Error("Connection refused. Check your internet connection.");
  } else if (error.code === "ETIMEDOUT") {
    throw new Error(
      "Request timed out. The server may be slow or unreachable."
    );
  } else if (error.response) {
    throw new Error(
      `HTTP ${error.response.status}: ${error.response.statusText}`
    );
  } else {
    throw new Error(`Network error: ${error.message}`);
  }
}
```

### 2. Parsing Errors

```javascript
function extractJobData($, element) {
  try {
    const $job = $(element);

    // Extract with fallbacks
    const title =
      $job.find("h2, .title").first().text().trim() || "Unknown Title";
    const company =
      $job.find(".company").first().text().trim() || "Unknown Company";

    // ... rest of extraction

    return job;
  } catch (error) {
    console.warn(`⚠️  Failed to parse job: ${error.message}`);
    return null; // Skip this job
  }
}
```

### 3. File System Errors

```javascript
try {
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), "utf8");
} catch (error) {
  if (error.code === "EACCES") {
    throw new Error("Permission denied. Cannot write to output directory.");
  } else if (error.code === "ENOSPC") {
    throw new Error("No space left on device.");
  } else {
    throw new Error(`File write error: ${error.message}`);
  }
}
```

## Testing Checklist

### Functional Tests

- [ ] Scraper runs with valid keyword
- [ ] Scraper handles invalid keyword gracefully
- [ ] Location filter works (if supported)
- [ ] Output file is created in correct location
- [ ] JSON output is valid and well-formatted
- [ ] All required fields are present in output
- [ ] Job URLs are clickable and valid
- [ ] Rate limiting delays are working

### Edge Cases

- [ ] Empty search results (no jobs found)
- [ ] Special characters in keyword (e.g., "C++", "Node.js")
- [ ] Very long keywords
- [ ] Network timeout
- [ ] Invalid HTML structure
- [ ] Missing optional fields (company URL)

### Data Validation

- [ ] No duplicate jobs in output
- [ ] All job titles are non-empty
- [ ] All company names are non-empty
- [ ] All job URLs are valid
- [ ] Timestamps are in ISO format
- [ ] recruiter_or_contact is always null

## Performance Considerations

### Memory Usage

- Process jobs in batches if dealing with large result sets
- Don't load entire HTML into memory multiple times
- Clear cheerio instances after parsing

### Network Efficiency

- Reuse HTTP connections (axios does this by default)
- Implement exponential backoff for retries
- Cache results to avoid redundant requests

### Rate Limiting

- Default: 2 seconds between requests
- Configurable via environment variable
- Respect server load indicators

## Security Considerations

### Input Validation

- Sanitize keyword input to prevent injection
- Validate URL construction
- Limit keyword length

### Output Safety

- Sanitize extracted data before writing to file
- Validate file paths to prevent directory traversal
- Use safe JSON serialization

## Deployment Checklist

- [ ] Node.js v16+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Output directory created (or auto-create)
- [ ] README.md with usage instructions
- [ ] .gitignore includes output/ directory
- [ ] Error handling tested
- [ ] Rate limiting verified
- [ ] Sample output validated

## Known Limitations (Documented)

1. **No Recruiter Contacts**: RemoteOK doesn't display recruiter email, phone,
   or LinkedIn on public pages
2. **Location Filtering**: May be limited by RemoteOK's URL structure
3. **Pagination**: Initial version scrapes first page only
4. **Dynamic Content**: Assumes HTML is server-rendered (no JavaScript required)
5. **Rate Limiting**: Conservative delays may slow down large scrapes
6. **Structure Changes**: Selectors may break if RemoteOK updates their HTML

## Future Improvements (Out of Scope)

1. Multi-page scraping (pagination support)
2. Concurrent requests with connection pooling
3. Proxy rotation for IP diversity
4. Retry logic with exponential backoff
5. Progress bar for long-running scrapes
6. CSV output format option
7. Email notifications on completion
8. Scheduled scraping with cron
9. Database storage instead of JSON files
10. API endpoint wrapper
