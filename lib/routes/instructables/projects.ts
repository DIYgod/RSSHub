import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/projects/:category?',
    categories: ['other'],
    example: '/instructables/projects/circuits',
    parameters: { category: 'Category, empty by default, can be found in URL or see the table below' },
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
            source: ['instructables.com/projects'],
            target: '/projects',
        },
    ],
    name: 'Projects',
    maintainers: ['wolfg1969'],
    handler,
    url: 'instructables.com/projects',
    description: `| All | Circuits | Workshop | Craft | Cooking | Living | Outside | Teachers |
| --- | -------- | -------- | ----- | ------- | ------ | ------- | -------- |
|     | circuits | workshop | craft | cooking | living | outside | teachers |`,
};

async function handler(ctx) {
    const { category = 'all' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const siteDomain = 'instructables.com';

    let pathPrefix, projectFilter;
    if (category === 'all') {
        pathPrefix = '';
        projectFilter = '';
    } else {
        pathPrefix = `${category}/`;
        const filterValue = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        projectFilter = category === 'teachers' ? `&& teachers:=${filterValue}` : ` && category:=${filterValue}`;
    }

    const pageLink = `https://${siteDomain}/${pathPrefix}projects`;

    const pageResponse = await ofetch(pageLink);
    const $ = load(pageResponse);
    const { typesenseProxy, typesenseApiKey } = JSON.parse($('script#js-page-context').text());

    const data = await ofetch(`${typesenseProxy}/collections/projects/documents/search`, {
        method: 'get',
        baseURL: `https://${siteDomain}`,
        headers: {
            Referer: pageLink,
            Host: siteDomain,
            'x-typesense-api-key': typesenseApiKey,
        },
        query: {
            q: '*',
            query_by: 'title,stepBody,screenName',
            page: 1,
            per_page: limit,
            sort_by: 'publishDate:desc',
            include_fields: 'title,urlString,coverImageUrl,screenName,publishDate,favorites,views,primaryClassification,featureFlag,prizeLevel,IMadeItCount',
            filter_by: `featureFlag:=true${projectFilter}`,
        },
        parseResponse: JSON.parse,
    });

    return {
        title: 'Instructables Projects', // 项目的标题
        link: `https://${siteDomain}/projects`, // 指向项目的链接
        description: 'Instructables Projects', // 描述项目
        language: 'en', // 频道语言
        item: data.hits.map((item) => ({
            title: item.document.title,
            link: `https://${siteDomain}/${item.document.urlString}`,
            author: item.document.screenName,
            description: `<img src="${item.document.coverImageUrl}?auto=webp&crop=1.2%3A1&frame=1&width=500" width="500">`,
            pubDate: parseDate(item.document.publishDate),
            category: item.document.primaryClassification,
        })),
    };
}
