import MarkdownIt from 'markdown-it';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/keywords/:keyword/:sortBy?',
    name: 'Search by keyword',
    maintainers: ['zha'],
    categories: ['program-update'],
    example: '/npm/search/keywords/n8n-community-node-package',
    parameters: {
        keyword: 'NPM package keyword',
        sortBy: 'Sort order: score, downloads_weekly, downloads_monthly, dependent_count, published_at',
    },
    radar: [
        {
            source: ['www.npmjs.com/search'],
            target: '/search/keywords/:keyword',
        },
    ],
    handler,
};

const apiBaseUrl = 'https://registry.npmjs.org/-/v1/search';
const npmPackageBaseUrl = 'https://www.npmjs.com/package/';
const npmSearchBaseUrl = 'https://www.npmjs.com/search';
const registryPackageBaseUrl = 'https://registry.npmjs.org/';
const sortByMap = {
    score: 'score',
    downloads_weekly: 'downloads_weekly',
    downloads_monthly: 'downloads_monthly',
    dependent_count: 'dependent_count',
    published_at: 'published_at',
};
const defaultSortBy = 'score';
const markdown = new MarkdownIt({
    html: true,
    linkify: true,
});

function fetchPackageDetail(name: string) {
    const detailUrl = registryPackageBaseUrl + encodeURIComponent(name);
    return cache.tryGet(detailUrl, () => ofetch(detailUrl));
}

async function handler(ctx): Promise<Data> {
    const keyword = ctx.req.param('keyword');
    const sortBy = ctx.req.param('sortBy') ?? defaultSortBy;
    const query = 'keywords:' + keyword;
    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const size = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const sortKey = sortBy in sortByMap ? sortByMap[sortBy] : defaultSortBy;

    const searchResult = await ofetch(apiBaseUrl, {
        query: {
            text: query,
            size,
            from: 0,
            sort: sortKey,
        },
    });

    const items = await Promise.all(
        searchResult.objects.map(async (result) => {
            const packageInfo = result.package;
            const link = packageInfo.links?.npm || npmPackageBaseUrl + packageInfo.name;
            const packageDetail = await fetchPackageDetail(packageInfo.name);
            const readmeHtml = packageDetail.readme ? markdown.render(packageDetail.readme) : undefined;

            return {
                title: packageInfo.name,
                description: readmeHtml ?? packageInfo.description ?? '',
                link,
                pubDate: packageInfo.date ? parseDate(packageInfo.date) : undefined,
                author: packageInfo.publisher?.username || packageInfo.publisher?.name,
                category: packageInfo.keywords,
            };
        })
    );

    return {
        title: 'npm search - ' + query,
        link: npmSearchBaseUrl + '?q=' + encodeURIComponent(query) + '&sortBy=' + sortKey,
        item: items,
    };
}
