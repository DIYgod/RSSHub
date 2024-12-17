import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { art } from '@/utils/render';
import { Context } from 'hono';
import { getCurrentPath } from '@/utils/helpers';
import { Route } from '@/types';

const __dirname = getCurrentPath(import.meta.url);

interface GeoLocation {
    lat: number;
    lng: number;
}

interface JobInformation {
    title: string;
    description: string;
    company_info?: {
        description: string;
    };
    location?: string;
}

interface ProcessedJobData {
    company_name: string;
    is_compensation_transparent: boolean;
    yearly_min_compensation?: number;
    yearly_max_compensation?: number;
    workplace_type?: string;
    requirements_summary?: string;
    job_category: string;
    role_activities: string[];
}

interface JobHit {
    apply_url: string;
    published_date: number;
    job_information: JobInformation;
    v5_processed_job_data: ProcessedJobData;
    _geoloc: GeoLocation[];
}

interface AlgoliaSearchResult {
    hits: JobHit[];
    nbHits: number;
    page: number;
    nbPages: number;
    query: string;
}

interface AlgoliaResponse {
    results: AlgoliaSearchResult[];
}

const ALGOLIA_APPLICATION_ID = '8HEMFGMPST';
const ALGOLIA_API_KEY = '360c8026d33e372e6b37d18b177f7df5';
const ALGOLIA_BASE_URL = 'https://8hemfgmpst-1.algolianet.com/1/indexes/*/queries';
const ALGOLIA_INDEX_NAME = 'V2_Marketplace_Jobs';

const renderJobDescription = (jobInfo: JobInformation, processedData: ProcessedJobData) =>
    art(path.join(__dirname, 'templates/jobs.art'), {
        company_name: processedData.company_name,
        location: jobInfo.location,
        is_compensation_transparent: Boolean(processedData.is_compensation_transparent && processedData.yearly_min_compensation && processedData.yearly_max_compensation),
        yearly_min_compensation_formatted: processedData.yearly_min_compensation?.toLocaleString() ?? '',
        yearly_max_compensation_formatted: processedData.yearly_max_compensation?.toLocaleString() ?? '',
        workplace_type: processedData.workplace_type ?? 'Not specified',
        requirements_summary: processedData.requirements_summary ?? 'No requirements specified',
        job_description: jobInfo.description ?? '',
        has_company_info: Boolean(jobInfo.company_info),
        company_info_description: jobInfo.company_info?.description ?? '',
    });

const transformJobItem = (item: JobHit) => {
    const { job_information: jobInfo, v5_processed_job_data: processedData, published_date, apply_url } = item;

    return {
        title: `${jobInfo.title} - ${processedData.company_name}`,
        description: renderJobDescription(jobInfo, processedData),
        link: apply_url,
        pubDate: new Date(published_date).toUTCString(),
        category: [processedData.job_category, ...processedData.role_activities, processedData.workplace_type].filter((x): x is string => !!x),
        author: processedData.company_name,
    };
};

export const route: Route = {
    path: '/jobs/:keywords',
    categories: ['other'],
    example: '/hiringcafe/jobs/sustainability',
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
    name: 'Jobs',
    maintainers: ['mintyfrankie'],
    handler,
};

async function handler(ctx: Context) {
    const { keywords } = ctx.req.param();

    const payload = {
        requests: [
            {
                indexName: ALGOLIA_INDEX_NAME,
                params: `query=${keywords}`,
            },
        ],
    };

    const response = await ofetch<AlgoliaResponse>(ALGOLIA_BASE_URL, {
        method: 'POST',
        body: payload,
        headers: {
            'X-Algolia-API-Key': ALGOLIA_API_KEY,
            'X-Algolia-Application-Id': ALGOLIA_APPLICATION_ID,
        },
    });

    const data = response.results[0].hits ?? [];
    const items = data.map((item) => transformJobItem(item));

    return {
        title: `HiringCafe Jobs: ${keywords}`,
        description: `Job search results for "${keywords}" on HiringCafe`,
        link: `https://hiring.cafe/jobs?q=${encodeURIComponent(keywords)}`,
        item: items,
    };
}
