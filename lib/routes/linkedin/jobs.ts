import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { EXP_LEVELS, EXP_LEVELS_QUERY_KEY, JOB_TYPES, JOB_TYPES_QUERY_KEY, KEYWORDS_QUERY_KEY, parseJobSearch, parseParamsToSearchParams, parseParamsToString, parseRouteParam } from './utils';

const BASE_URL = 'https://www.linkedin.com/';
const JOB_SEARCH_PATH = '/jobs-guest/jobs/api/seeMoreJobPostings/search';

export const route: Route = {
    path: '/jobs/:job_types/:exp_levels/:keywords?/:routeParams?',
    categories: ['social-media'],
    view: ViewType.Notifications,
    example: '/linkedin/jobs/C-P/1/software engineer',
    parameters: {
        job_types: "See the following table for details, use '-' as delimiter",
        exp_levels: "See the following table for details, use '-' as delimiter",
        keywords: 'keywords',
        routeParams: 'additional query parameters, see the table below',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.linkedin.com/jobs/search'],
            // Migrate from https://github.com/DIYgod/RSSHub-Radar/blob/096589db99f993c262ec8edb51a5676325439bc5/src/lib/radar-rules.ts#L15501
            target: (params, url) => {
                const searchParams = new URLSearchParams(new URL(url).search);
                const fJT = parseRouteParam(searchParams.get('f_JT'));
                const fE = parseRouteParam(searchParams.get('f_E'));
                const keywords = encodeURIComponent(searchParams.get('keywords') || '');

                const newSearchParams = new URLSearchParams();
                // Copy non-existent key-value pairs from searchParams to newSearchParams
                for (const [key, value] of searchParams.entries()) {
                    if (!['f_JT', 'f_E', 'keywords'].includes(key)) {
                        newSearchParams.append(key, value);
                    }
                }
                return `/linkedin/jobs/${fJT}/${fE}/${keywords}/?${newSearchParams.toString()}`;
            },
        },
    ],
    name: 'Jobs',
    maintainers: ['BrandNewLifeJackie26', 'zhoukuncheng'],
    handler,
    description: `#### \`job_types\` list

| Full Time | Part Time | Contractor | All |
| --------- | --------- | ---------- | --- |
| F         | P         | C          | all |

#### \`exp_levels\` list

| Intership | Entry Level | Associate | Mid-Senior Level | Director | All |
| --------- | ----------- | --------- | ---------------- | -------- | --- |
| 1         | 2           | 3         | 4                | 5        | all |

#### \`routeParams\` additional query parameters

##### \`f_WT\` list

| Onsite | Remote | Hybrid |
| ------ | ------- | ------ |
|    1   |    2    |   3    |

##### \`geoId\`

  Geographic location ID. You can find this ID in the URL of a LinkedIn job search page that is filtered by location.

  For example:
  91000012 is the ID of East Asia.

##### \`f_TPR\`

  Time posted range. Here are some possible values:

  *   \`r86400\`: Past 24 hours
  *   \`r604800\`: Past week
  *   \`r2592000\`: Past month

  For example:

  1.  If we want to search software engineer jobs of all levels and all job types, use \`/linkedin/jobs/all/all/software engineer\`
  2.  If we want to search all entry level contractor/part time software engineer jobs, use \`/linkedin/jobs/P-C/2/software engineer\`
  3.  If we want to search remote mid-senior level software engineer jobs in APAC posted within the last month, use \`/linkedin/jobs/F/4/software%20engineer/f_WT=2&geoId=91000003&f_TPR=r2592000\`

  **To make it easier, the recommended way is to start a search on [LinkedIn](https://www.linkedin.com/jobs/search) and use [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) to load the specific feed.**`,
};

async function handler(ctx) {
    const jobTypesParam = parseParamsToSearchParams(ctx.req.param('job_types'), JOB_TYPES);
    const expLevelsParam = parseParamsToSearchParams(ctx.req.param('exp_levels'), EXP_LEVELS);
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));

    let url = new URL(JOB_SEARCH_PATH, BASE_URL);

    // keep for backward compatibility
    url.searchParams.append(KEYWORDS_QUERY_KEY, ctx.req.param('keywords') || '');
    url.searchParams.append(JOB_TYPES_QUERY_KEY, jobTypesParam); // see JOB_TYPES in utils.js
    url.searchParams.append(EXP_LEVELS_QUERY_KEY, expLevelsParam); // see EXPERIENCE_LEVELS in utils.js

    // Add route params to URL
    for (const [key, value] of routeParams) {
        if (!url.searchParams.has(key)) {
            url.searchParams.append(key, value);
        }
    }
    url = url.toString();

    // Parse job search page
    const response = await ofetch(url);
    const jobs = parseJobSearch(response);

    const jobTypes = parseParamsToString(ctx.req.param('job_types'), JOB_TYPES);
    const expLevels = parseParamsToString(ctx.req.param('exp_levels'), EXP_LEVELS);
    const feedTitle = 'LinkedIn Job Listing' + (jobTypes ? ` | Job Types: ${jobTypes}` : '') + (expLevels ? ` | Experience Levels: ${expLevels}` : '') + (ctx.req.param('keywords') ? ` | Keywords: ${ctx.req.param('keywords')}` : '');

    return {
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
}
