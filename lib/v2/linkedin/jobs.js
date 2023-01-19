const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseJobSearch, KEYWORDS_QUERY_KEY, JOB_TYPES, JOB_TYPES_QUERY_KEY, EXP_LEVELS_QUERY_KEY, parseParamsToSearchParams, EXP_LEVELS, parseParamsToString } = require('./utils');

const BASE_URL = 'https://www.linkedin.com/';
const JOB_SEARCH_PATH = '/jobs-guest/jobs/api/seeMoreJobPostings/search';

module.exports = async (ctx) => {
    const jobTypesParam = parseParamsToSearchParams(ctx.params.job_types, JOB_TYPES);
    const expLevelsParam = parseParamsToSearchParams(ctx.params.exp_levels, EXP_LEVELS);

    let url = new URL(JOB_SEARCH_PATH, BASE_URL);
    url.searchParams.append(KEYWORDS_QUERY_KEY, ctx.params.keywords || '');
    url.searchParams.append(JOB_TYPES_QUERY_KEY, jobTypesParam); // see JOB_TYPES in utils.js
    url.searchParams.append(EXP_LEVELS_QUERY_KEY, expLevelsParam); // see EXPERIENCE_LEVELS in utils.js
    url = url.toString();

    // Parse job search page
    const response = await got({
        method: 'get',
        url,
    });
    const jobs = parseJobSearch(response.data);

    const jobTypes = parseParamsToString(ctx.params.job_types, JOB_TYPES);
    const expLevels = parseParamsToString(ctx.params.exp_levels, EXP_LEVELS);
    const feedTitle = 'LinkedIn Job Listing' + (jobTypes ? ` | Job Types: ${jobTypes}` : '') + (expLevels ? ` | Experience Levels: ${expLevels}` : '') + (ctx.params.keywords ? ` | Keywords: ${ctx.params.keywords}` : '');
    ctx.state.data = {
        title: feedTitle,
        link: url,
        description: 'This feed gets LinkedIn job posts',
        item: jobs.map((job) => {
            const title = `${job.company} is hiring ${job.title}`;
            const description = `Title: ${job.title} | Company: ${job.company} | Location: ${job.location} `;

            return {
                title, // item title
                description, // job description
                pubDate: parseDate(job.pubDate), // data publish date
                link: job.link, // job source link
            };
        }),
    };
};
