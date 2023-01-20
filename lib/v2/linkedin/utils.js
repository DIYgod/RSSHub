const cheerio = require('cheerio');
const { Job } = require('./models');

/**
 * Constants
 */
const KEYWORDS_QUERY_KEY = 'keywords';

const JOB_TYPES_QUERY_KEY = 'f_JT';

const JOB_TYPES = {
    F: 'full-time',
    P: 'part-time',
    C: 'contract',
};

const EXP_LEVELS_QUERY_KEY = 'f_E';

const EXP_LEVELS = {
    1: 'internship',
    2: 'entry',
    3: 'associate',
    4: 'mid-senior',
    5: 'director',
};

/**
 * Params parsing
 */

/**
 * Parse params in route into valid query params
 * e.g. /jobs/:keywords/:job_types/:exp_levels
 *   if job_types is 'C-T'
 *   the output search param is 'C,T', which can be
 *   used as search param in query
 * @param {String} params params in route (separated by '-')
 * @param {Object} map valid value map for this param
 * @returns search params separated by ',' that can be used
 *   as search param in url
 */
function parseParamsToSearchParams(params, map) {
    const validParamValues = params.split('-').filter((v) => v in map);
    return validParamValues.join(',');
}

/**
 * Parse params in route into human readable strings
 * e.g. /jobs/:keywords/:job_types/:exp_levels
 *   if job_types is 'C-T'
 *   the output is 'contract,full-time'
 * @param {String} params params in route (separated by '-')
 * @param {Object} map valid value map for this param
 * @returns param value strings separated by ','
 */
function parseParamsToString(params, map) {
    const validParamValues = params
        .split('-')
        .filter((v) => v in map)
        .map((v) => map[v]);
    return validParamValues.join(',');
}

/**
 * HTML page parsing
 */

/**
 * Parse job search page
 * Example page: https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=Software%20Engineer&location=United%20States&locationId=&geoId=103644278&sortBy=R&f_TPR=&position=1&pageNum=0
 *
 * @param {String} data HTML string of job search page
 * @returns {Job[]} Array of jobs with data filled
 */
function parseJobSearch(data) {
    const $ = cheerio.load(data);

    // Parse data
    const jobs = $('li')
        .map((i, elem) => {
            const elemHtml = $(elem);
            const link = elemHtml.find('a.base-card__full-link').attr('href').split('?')[0];
            const title = elemHtml.find('h3.base-search-card__title').text().trim();
            const company = elemHtml.find('h4.base-search-card__subtitle').text().trim();
            const location = elemHtml.find('span.job-search-card__location').text().trim();
            const pubDate = elemHtml.find('time').attr('datetime');

            return new Job(title, link, company, location, pubDate);
        })
        .toArray();
    return jobs;
}

/**
 * Parse job detail page
 * Example page: https://www.linkedin.com/jobs/view/software-engineer-backend-junior-at-genies-3429649821?trk=public_jobs_topcard-title
 *
 * @param {String} data HTML string of job detail page
 * @returns {Job} Job details
 */
function parseJobDetail(data) {
    const job = new Job();
    const $ = cheerio.load(data);

    job.recruiter = $('a.message-the-recruiter__cta').attr(`href`);
    job.description = $('div.description__text description__text--rich').text();

    return job;
}

module.exports = {
    parseParamsToSearchParams,
    parseParamsToString,
    parseJobDetail,
    parseJobSearch,
    JOB_TYPES,
    JOB_TYPES_QUERY_KEY,
    EXP_LEVELS,
    EXP_LEVELS_QUERY_KEY,
    KEYWORDS_QUERY_KEY,
};
