import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { art } from '@/utils/render';
import { Context } from 'hono';
import { getCurrentPath } from '@/utils/helpers';
import { Route } from '@/types';

const __dirname = getCurrentPath(import.meta.url);

interface GeoLocation {
    lat: number;
    lon: number;
}

interface JobInformation {
    title: string;
    description: string;
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
    formatted_workplace_location?: string;
}

interface JobResult {
    id: string;
    apply_url: string;
    job_information: JobInformation;
    v5_processed_job_data: ProcessedJobData;
    _geoloc: GeoLocation[];
    estimated_publish_date: string;
}

interface ApiResponse {
    results: JobResult[];
    total: number;
}

const API_BASE_URL = 'https://hiring.cafe/api/search-jobs';

const renderJobDescription = (jobInfo: JobInformation, processedData: ProcessedJobData) =>
    art(path.join(__dirname, 'templates/jobs.art'), {
        company_name: processedData.company_name,
        location: processedData.formatted_workplace_location,
        is_compensation_transparent: Boolean(processedData.is_compensation_transparent && processedData.yearly_min_compensation && processedData.yearly_max_compensation),
        yearly_min_compensation_formatted: processedData.yearly_min_compensation?.toLocaleString() ?? '',
        yearly_max_compensation_formatted: processedData.yearly_max_compensation?.toLocaleString() ?? '',
        workplace_type: processedData.workplace_type ?? 'Not specified',
        requirements_summary: processedData.requirements_summary ?? 'No requirements specified',
        job_description: jobInfo.description ?? '',
    });

const transformJobItem = (item: JobResult) => {
    const { job_information: jobInfo, v5_processed_job_data: processedData, estimated_publish_date, apply_url } = item;

    return {
        title: `${jobInfo.title} - ${processedData.company_name}`,
        description: renderJobDescription(jobInfo, processedData),
        link: apply_url,
        pubDate: new Date(estimated_publish_date).toUTCString(),
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
        size: 20,
        page: 0,
        searchState: {
            searchQuery: keywords,
        },
    };

    const response = await ofetch<ApiResponse>(API_BASE_URL, {
        method: 'POST',
        body: payload,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const items = response.results.map((item) => transformJobItem(item));

    return {
        title: `HiringCafe Jobs: ${keywords}`,
        description: `Job search results for "${keywords}" on HiringCafe`,
        link: `https://hiring.cafe/jobs?q=${encodeURIComponent(keywords)}`,
        item: items,
    };
}
