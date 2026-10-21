import { load } from 'cheerio';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

const CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

const API = {
    BASE_URL: 'https://hiringcafe.com/classic',
} as const;

interface GeoLocation {
    readonly lat: number;
    readonly lon: number;
}

interface JobInformation {
    readonly title: string;
    readonly description?: string;
    readonly company_info_description?: string;
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
    readonly estimated_publish_date_millis: number;
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

const validateSearchParams = ({ keywords, page = 0, size = CONFIG.DEFAULT_PAGE_SIZE }: SearchParams): SearchParams => {
    if (!keywords?.trim()) {
        throw new InvalidParameterError('Enter at least one non-whitespace job search keyword.');
    }
    const normalizedSize = Math.floor(size);
    return {
        keywords: keywords.trim(),
        page: Math.max(0, Math.floor(page)),
        size: Math.min(Math.max(1, normalizedSize), CONFIG.MAX_PAGE_SIZE),
    };
};

async function getSearchPage(url: string) {
    try {
        return await ofetch(url);
    } catch (error) {
        if ((error as { statusCode?: number }).statusCode !== 403) {
            throw error;
        }
        const { page, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
        try {
            await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForSelector('script#__NEXT_DATA__', { state: 'attached', timeout: 10000 });
            return await page.content();
        } finally {
            await destroy();
        }
    }
}

const getSearchUrl = (searchParams: SearchParams) => {
    const url = new URL(API.BASE_URL);
    url.searchParams.set('searchState', JSON.stringify({ searchQuery: searchParams.keywords, sortBy: searchParams.sortBy || 'date' }));
    return url.href;
};

const fetchJobs = async (searchParams: SearchParams): Promise<ApiResponse> => {
    const response = await getSearchPage(getSearchUrl(searchParams));
    const $ = load(response);
    const data = $('#__NEXT_DATA__').text();
    if (!data) {
        throw new Error('HiringCafe public search data was not found.');
    }
    const pageProps = (JSON.parse(data) as { props: { pageProps: { ssrHits: JobResult[]; ssrTotalCount: number; ssrPage: number; ssrError?: string } } }).props.pageProps;
    if (pageProps.ssrError || !Array.isArray(pageProps.ssrHits) || pageProps.ssrPage !== 0) {
        throw new Error(`HiringCafe public search is unavailable: ${pageProps.ssrError || 'invalid first-page data'}`);
    }
    const results = [...pageProps.ssrHits];
    if (results.every((item) => Number.isFinite(item.v5_processed_job_data.estimated_publish_date_millis))) {
        results.sort((a, b) => b.v5_processed_job_data.estimated_publish_date_millis - a.v5_processed_job_data.estimated_publish_date_millis);
    }
    return { results: results.slice(0, searchParams.size || CONFIG.DEFAULT_PAGE_SIZE), total: pageProps.ssrTotalCount };
};

const renderJobDescription = (jobInfo: JobInformation, processedData: ProcessedJobData): string => {
    const isCompensationTransparent = processedData.is_compensation_transparent && Number.isFinite(processedData.yearly_min_compensation) && Number.isFinite(processedData.yearly_max_compensation);
    const companyInfoDescription = jobInfo.company_info_description;

    return renderToString(
        <>
            {processedData.formatted_workplace_location ? (
                <p>
                    <strong>Location:</strong> {processedData.formatted_workplace_location}
                </p>
            ) : null}
            {isCompensationTransparent ? (
                <p>
                    <strong>Compensation:</strong> ${processedData.yearly_min_compensation?.toLocaleString()} - ${processedData.yearly_max_compensation?.toLocaleString()} per year
                </p>
            ) : null}
            {processedData.workplace_type ? (
                <p>
                    <strong>Workplace Type:</strong> {processedData.workplace_type}
                </p>
            ) : null}
            {processedData.requirements_summary ? (
                <p>
                    <strong>Requirements:</strong> {processedData.requirements_summary}
                </p>
            ) : null}
            <div class="job-description">{jobInfo.description ? raw(jobInfo.description) : null}</div>
            {companyInfoDescription ? (
                <>
                    <h2>About {processedData.company_name}</h2>
                    {raw(companyInfoDescription)}
                </>
            ) : null}
        </>
    );
};

const transformJobItem = (item: JobResult) => {
    const { job_information: jobInfo, v5_processed_job_data: processedData, apply_url: applyUrl, id } = item;

    return {
        title: `${jobInfo.title} - ${processedData.company_name}`,
        description: renderJobDescription(jobInfo, processedData),
        link: applyUrl,
        pubDate: Number.isFinite(processedData.estimated_publish_date_millis) ? parseDate(processedData.estimated_publish_date_millis) : undefined,
        category: [processedData.job_category, ...processedData.role_activities, processedData.workplace_type].filter((x): x is string => !!x),
        author: processedData.company_name,
        guid: id,
    };
};

async function handler(ctx: Context): Promise<Data> {
    const searchParams = validateSearchParams({
        keywords: ctx.req.param('keywords')!,
    });

    const response = await fetchJobs(searchParams);
    const items = response.results.map((item) => transformJobItem(item));

    return {
        language: 'en',
        title: `HiringCafe Jobs: ${searchParams.keywords}`,
        description: `Job search results for "${searchParams.keywords}" on HiringCafe`,
        link: getSearchUrl(searchParams),
        item: items,
    };
}

export const route: Route = {
    path: '/jobs/:keywords',
    categories: ['other'],
    example: '/hiring.cafe/jobs/sustainability',
    parameters: { keywords: 'Keywords to search for' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
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
    description: 'Search uses the current public website’s default region, which HiringCafe selects from the visitor’s location. Public job summaries are included when full descriptions are unavailable.',
    name: 'Jobs',
    maintainers: ['mintyfrankie'],
    handler,
};
