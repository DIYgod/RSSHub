import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/jobs/:keywords',
    categories: ['other'],
    example: '/hiringcafe/jobs/sustainability/',
    parameters: { keywords: 'Keywords to search for' },
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
            source: ['hiring.cafe'],
        },
    ],
    name: 'HiringCafe Jobs',
    maintainers: ['mintyfrankie'],
    handler,
};

async function handler(ctx) {
    const { keywords } = ctx.req.param();

    // NOTE: captured from the network tab
    const ALGOLIA_APPLICATION_ID = '8HEMFGMPST';
    const ALGOLIA_API_KEY = '360c8026d33e372e6b37d18b177f7df5';
    const BASE_URL = 'https://8hemfgmpst-1.algolianet.com/1/indexes/*/queries';

    const payload = {
        requests: [
            {
                indexName: 'V2_Marketplace_Jobs',
                params: `query=${keywords}`,
            },
        ],
    };

    const response = await ofetch(BASE_URL, {
        method: 'POST',
        body: payload,
        headers: {
            'X-Algolia-API-Key': ALGOLIA_API_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APPLICATION_ID,
        },
    });

    const data = response.results[0].hits ?? [];

    const items = data.map((item) => {
        const { job_information: jobInfo, v5_processed_job_data: processedData, published_date, apply_url } = item;

        const title = `${jobInfo.title} - ${processedData.company_name}`;

        const description = `
            <h1>${jobInfo.title}</h1>
            <p><strong>Location:</strong> ${jobInfo.location}</p>
            <p><strong>Company:</strong> ${processedData.company_name}</p>
            ${
                processedData.is_compensation_transparent
                    ? `
                <p><strong>Compensation:</strong> $${processedData.yearly_min_compensation.toLocaleString()} - $${processedData.yearly_max_compensation.toLocaleString()} per year</p>
            `
                    : ''
            }
            <p><strong>Workplace Type:</strong> ${processedData.workplace_type}</p>
            <p><strong>Requirements:</strong> ${processedData.requirements_summary}</p>
            <div class="job-description">
                ${jobInfo.description}
            </div>
            ${
                jobInfo.company_info
                    ? `
                <h2>About ${processedData.company_name}</h2>
                ${jobInfo.company_info.description}
            `
                    : ''
            }
        `;

        return {
            title,
            description,
            link: apply_url,
            pubDate: new Date(published_date).toUTCString(),
            category: [processedData.job_category, ...processedData.role_activities, processedData.workplace_type].filter(Boolean),
            author: processedData.company_name,
        };
    });

    return {
        title: `HiringCafe Jobs: ${keywords}`,
        description: `Job search results for "${keywords}" on HiringCafe`,
        link: `https://hiring.cafe/jobs?q=${encodeURIComponent(keywords)}`,
        item: items,
    };
}
