import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

const API = {
    BASE_URL: 'https://hiring.cafe/api/search-jobs',
    HEADERS: {
        'Content-Type': 'application/json',
    },
} as const;

interface GeoLocation {
    readonly lat: number;
    readonly lon: number;
}

interface JobInformation {
    readonly title: string;
    readonly description: string;
}

interface ProcessedJobData {
    readonly company_name: string;
    readonly is_compensation_transparent: boolean;
    readonly yearly_min_compensation?: number;
    readonly yearly_max_compensation?: number;
    readonly workplace_type?: string;
    readonly requirements_summary?: string;
    readonly job_category: string;
    readonly role_activities: readonly string[];
    readonly formatted_workplace_location?: string;
    readonly estimated_publish_date_millis: string;
}

interface JobResult {
    readonly id: string;
    readonly apply_url: string;
    readonly job_information: JobInformation;
    readonly v5_processed_job_data: ProcessedJobData;
    readonly _geoloc: readonly GeoLocation[];
}

interface ApiResponse {
    readonly results: readonly JobResult[];
    readonly total: number;
}

interface SearchParams {
    readonly keywords: string;
    readonly page?: number;
    readonly size?: number;
    readonly sortBy?: 'date' | 'default' | 'compensation_desc' | 'experience_asc';
}

const validateSearchParams = ({ keywords, page = 0, size = CONFIG.DEFAULT_PAGE_SIZE }: SearchParams): SearchParams => ({
    keywords: keywords.trim(),
    page: Math.max(0, Math.floor(Number(page))),
    size: Math.min(Math.max(1, Math.floor(Number(size))), CONFIG.MAX_PAGE_SIZE),
});

const fetchJobs = async (searchParams: SearchParams): Promise<ApiResponse> => {
    const payload = {
        size: searchParams.size || 20,
        page: searchParams.page || 0,
        searchState: {
            searchQuery: searchParams.keywords,
            sortBy: searchParams.sortBy || 'date',
        },
    };

    return await ofetch<ApiResponse>(API.BASE_URL, {
        method: 'POST',
        body: payload,
        headers: API.HEADERS,
    });
};

const renderJobDescription = (jobInfo: JobInformation, processedData: ProcessedJobData): string => {
    const isCompensationTransparent = Boolean(processedData.is_compensation_transparent && processedData.yearly_min_compensation && processedData.yearly_max_compensation);
    const companyInfoDescription = (jobInfo as { company_info_description?: string }).company_info_description;
    const hasCompanyInfo = Boolean(companyInfoDescription);

    return renderToString(
        <>
            <p>
                <strong>Company:</strong> {processedData.company_name}
            </p>
            <p>
                <strong>Location:</strong> {processedData.formatted_workplace_location ?? 'Remote/Unspecified'}
            </p>
            {isCompensationTransparent ? (
                <p>
                    <strong>Compensation:</strong> ${processedData.yearly_min_compensation?.toLocaleString()} - ${processedData.yearly_max_compensation?.toLocaleString()} per year
                </p>
            ) : null}
            <p>
                <strong>Workplace Type:</strong> {processedData.workplace_type ?? 'Not specified'}
            </p>
            <p>
                <strong>Requirements:</strong> {processedData.requirements_summary ?? 'No requirements specified'}
            </p>
            <div class="job-description">{jobInfo.description ? raw(jobInfo.description) : null}</div>
            {hasCompanyInfo ? (
                <>
                    <h2>About {processedData.company_name}</h2>
                    {raw(companyInfoDescription as string)}
                </>
            ) : null}
        </>
    );
};

const transformJobItem = (item: JobResult) => {
    const { job_information: jobInfo, v5_processed_job_data: processedData, apply_url, id } = item;

    return {
        title: `${jobInfo.title} - ${processedData.company_name}`,
        description: renderJobDescription(jobInfo, processedData),
        link: apply_url,
        pubDate: new Date(processedData.estimated_publish_date_millis).toUTCString(),
        category: [processedData.job_category, ...processedData.role_activities, processedData.workplace_type].filter((x): x is string => !!x),
        author: processedData.company_name,
        guid: id,
    };
};

async function handler(ctx: Context) {
    const searchParams = validateSearchParams({
        keywords: ctx.req.param('keywords'),
    });

    const response = await fetchJobs(searchParams);
    const items = response.results.map((item) => transformJobItem(item));

    return {
        title: `HiringCafe Jobs: ${searchParams.keywords}`,
        description: `Job search results for "${searchParams.keywords}" on HiringCafe`,
        link: `https://hiring.cafe/jobs?q=${encodeURIComponent(searchParams.keywords)}`,
        item: items,
        total: response.total,
    };
}

export const route: Route = {
    path: '/jobs/:keywords',
    categories: ['other'],
    example: '/hiring.cafe/jobs/sustainability',
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
