#!/usr/bin/env node

/**
 * RemoteOK Job Scraper v1.0
 * 
 * A production-grade web scraper that extracts REAL job listings from RemoteOK.
 * Uses RemoteOK's public JSON API for reliable data extraction.
 * 
 * Usage: node index.js <keyword> [location]
 * Example: node index.js backend
 * Example: node index.js "product manager" USA
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  RATE_LIMIT_MS: 2000, // 2 seconds between requests
  REQUEST_TIMEOUT: 30000, // 30 seconds
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  BASE_URL: 'https://remoteok.com',
  OUTPUT_DIR: 'output'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean}
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Clean and normalize text
 * @param {string} text - Text to clean
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

// ============================================================================
// COMMAND-LINE INTERFACE
// ============================================================================

/**
 * Parse command-line arguments
 * @returns {{keyword: string, location: string|null}}
 */
function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }
  
  const keyword = args[0];
  const location = args[1] || null;
  
  return { keyword, location };
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              RemoteOK Job Scraper v1.0                         ║
╚════════════════════════════════════════════════════════════════╝

Usage: node index.js <keyword> [location]

Arguments:
  keyword     Job search term (required)
              Examples: "backend", "frontend", "product manager"
  
  location    Location filter (optional)
              Examples: "USA", "Europe", "Remote"
              Note: Filters results after fetching

Examples:
  node index.js backend
  node index.js "product manager" USA
  node index.js frontend Europe

Output:
  - Console: Progress logs and summary
  - File: output/jobs_<keyword>_<timestamp>.json

Features:
  ✓ Extracts REAL job data from RemoteOK JSON API
  ✓ Rate limiting (2 second delays)
  ✓ Comprehensive error handling
  ✓ JSON output with metadata

Known Limitations:
  ✗ Recruiter contact info not publicly available (always null)
  ✗ Location filtering done client-side (may not be perfect)

For more information, see README.md
  `);
}

// ============================================================================
// URL CONSTRUCTION
// ============================================================================

/**
 * Build RemoteOK JSON API URL from keyword
 * @param {string} keyword - Job search keyword
 * @returns {string}
 */
function buildSearchUrl(keyword) {
  // Convert keyword to URL-friendly format
  const urlKeyword = keyword.toLowerCase().replace(/\s+/g, '-');
  
  // RemoteOK provides a JSON API! Much better than HTML scraping
  return `${CONFIG.BASE_URL}/remote-${urlKeyword}-jobs.json`;
}

// ============================================================================
// HTTP REQUEST HANDLER
// ============================================================================

/**
 * Fetch JSON data from RemoteOK API
 * @param {string} url - URL to fetch
 * @returns {Promise<Array>} Array of job objects
 */
async function fetchJobs(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
      maxRedirects: 5
    });
    
    // RemoteOK returns an array of job objects
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected response format: expected array of jobs');
    }
    
    return response.data;
  } catch (error) {
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused. Check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timed out. The server may be slow or unreachable.');
    } else if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`No jobs found for this keyword. The URL may be incorrect: ${url}`);
      }
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

// ============================================================================
// DATA EXTRACTION & TRANSFORMATION
// ============================================================================

/**
 * Transform RemoteOK job object to our standard format
 * @param {Object} remoteOkJob - Job object from RemoteOK API
 * @returns {Object|null} Standardized job object or null
 */
function transformJob(remoteOkJob) {
  try {
    // Skip if this is metadata (first element in array)
    if (remoteOkJob.id === undefined || remoteOkJob.id === null) {
      return null;
    }
    
    // Extract and clean data
    const jobTitle = cleanText(remoteOkJob.position || '');
    const companyName = cleanText(remoteOkJob.company || '');
    const location = cleanText(remoteOkJob.location || 'Remote');
    
    // Build job URL
    const slug = remoteOkJob.slug || remoteOkJob.id;
    const jobUrl = slug ? `${CONFIG.BASE_URL}/remote-jobs/${slug}` : null;
    
    // Extract company URL if available
    const companyUrl = remoteOkJob.url && isValidUrl(remoteOkJob.url) ? remoteOkJob.url : null;
    
    // Validate required fields
    if (!jobTitle || !companyName || !jobUrl) {
      return null;
    }
    
    return {
      job_title: jobTitle,
      company_name: companyName,
      platform: 'RemoteOK',
      location: location,
      recruiter_or_contact: null, // Not publicly available
      job_url: jobUrl,
      company_careers_url: companyUrl,
      scraped_at: new Date().toISOString()
    };
  } catch (error) {
    console.warn(`⚠️  Failed to transform job: ${error.message}`);
    return null;
  }
}

/**
 * Filter jobs by location if specified
 * @param {Array<Object>} jobs - Array of job objects
 * @param {string|null} location - Location filter
 * @returns {Array<Object>}
 */
function filterByLocation(jobs, location) {
  if (!location) return jobs;
  
  const locationLower = location.toLowerCase();
  return jobs.filter(job => {
    const jobLocation = (job.location || '').toLowerCase();
    return jobLocation.includes(locationLower);
  });
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Validate a job object
 * @param {Object} job - Job object to validate
 * @returns {boolean}
 */
function validateJob(job) {
  // Required fields
  if (!job.job_title || job.job_title.trim() === '') {
    return false;
  }
  
  if (!job.company_name || job.company_name.trim() === '') {
    return false;
  }
  
  if (!job.job_url || !isValidUrl(job.job_url)) {
    return false;
  }
  
  // Platform must be set
  if (job.platform !== 'RemoteOK') {
    return false;
  }
  
  // scraped_at must be valid ISO timestamp
  if (!job.scraped_at || isNaN(Date.parse(job.scraped_at))) {
    return false;
  }
  
  return true;
}

/**
 * Remove duplicate jobs based on job URL
 * @param {Array<Object>} jobs - Array of job objects
 * @returns {Array<Object>}
 */
function removeDuplicates(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    if (seen.has(job.job_url)) {
      return false;
    }
    seen.add(job.job_url);
    return true;
  });
}

// ============================================================================
// FILE OUTPUT
// ============================================================================

/**
 * Save job results to JSON file
 * @param {Array<Object>} jobs - Array of job objects
 * @param {string} keyword - Search keyword
 * @param {string|null} location - Location filter
 * @returns {string} Path to saved file
 */
function saveResults(jobs, keyword, location) {
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, CONFIG.OUTPUT_DIR);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `jobs_${keyword.replace(/\s+/g, '_')}_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);
  
  // Prepare output data
  const output = {
    metadata: {
      keyword: keyword,
      location: location || 'Any',
      total_jobs: jobs.length,
      scraped_at: new Date().toISOString(),
      platform: 'RemoteOK',
      version: '1.0.0'
    },
    jobs: jobs
  };
  
  // Write to file with pretty printing
  try {
    fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf8');
    return filepath;
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error('Permission denied. Cannot write to output directory.');
    } else if (error.code === 'ENOSPC') {
      throw new Error('No space left on device.');
    } else {
      throw new Error(`File write error: ${error.message}`);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main scraper function
 */
async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║              🚀 RemoteOK Job Scraper v1.0                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Parse command-line arguments
    const { keyword, location } = parseArguments();
    
    console.log(`📋 Searching for: ${keyword}`);
    if (location) {
      console.log(`📍 Location filter: ${location}`);
    }
    console.log('');
    
    // Build API URL
    const url = buildSearchUrl(keyword);
    console.log(`🔗 API URL: ${url}\n`);
    
    // Fetch jobs from API
    console.log('⏳ Fetching jobs from RemoteOK API...');
    const rawJobs = await fetchJobs(url);
    console.log(`✅ Fetched ${rawJobs.length} items from API\n`);
    
    // Transform jobs to our format
    console.log('🔄 Transforming job data...');
    const transformedJobs = rawJobs
      .map(transformJob)
      .filter(job => job !== null);
    console.log(`   Transformed ${transformedJobs.length} jobs\n`);
    
    // Filter by location if specified
    let filteredJobs = transformedJobs;
    if (location) {
      console.log(`🔍 Filtering by location: ${location}...`);
      filteredJobs = filterByLocation(transformedJobs, location);
      console.log(`   ${filteredJobs.length} jobs match location\n`);
    }
    
    // Validate and clean data
    console.log('✅ Validating data...');
    const validJobs = filteredJobs.filter(validateJob);
    const uniqueJobs = removeDuplicates(validJobs);
    console.log(`   ${validJobs.length} valid jobs`);
    console.log(`   ${uniqueJobs.length} unique jobs\n`);
    
    if (uniqueJobs.length === 0) {
      console.log('⚠️  No valid jobs found. This could mean:');
      console.log('   - No jobs match your search criteria');
      console.log('   - The keyword may not have any listings');
      if (location) {
        console.log(`   - No jobs match the location filter: ${location}`);
      }
      console.log('');
      process.exit(0);
    }
    
    // Save results
    console.log('💾 Saving results...');
    const filepath = saveResults(uniqueJobs, keyword, location);
    console.log(`✅ Results saved to: ${filepath}\n`);
    
    // Print summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      📈 Summary                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`   Total jobs found: ${uniqueJobs.length}`);
    console.log(`   Platform: RemoteOK`);
    console.log(`   Keyword: ${keyword}`);
    console.log(`   Location: ${location || 'Any'}`);
    console.log(`   Output file: ${path.basename(filepath)}`);
    console.log('');
    
    // Print sample jobs
    if (uniqueJobs.length > 0) {
      console.log('📋 Sample jobs:');
      uniqueJobs.slice(0, 3).forEach((job, index) => {
        console.log(`\n   ${index + 1}. ${job.job_title}`);
        console.log(`      Company: ${job.company_name}`);
        console.log(`      Location: ${job.location}`);
        console.log(`      URL: ${job.job_url}`);
        if (job.company_careers_url) {
          console.log(`      Company URL: ${job.company_careers_url}`);
        }
      });
      
      if (uniqueJobs.length > 3) {
        console.log(`\n   ... and ${uniqueJobs.length - 3} more jobs`);
      }
    }
    
    console.log('\n✨ Scraping completed successfully!\n');
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                      ❌ Error                                  ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error(`\n${error.message}\n`);
    
    if (process.env.DEBUG) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  buildSearchUrl,
  transformJob,
  validateJob,
  filterByLocation
};
