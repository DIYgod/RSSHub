import { Route } from '@/types';
import got from '@/utils/got';

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
    const category = ctx.req.param('category') ?? 'all';

    const siteDomain = 'www.instructables.com';
    const apiKey = 'NU5CdGwyRDdMVnVmM3l4cWNqQzFSVzJNZU5jaUxFU3dGK3J2L203MkVmVT02ZWFYeyJleGNsdWRlX2ZpZWxkcyI6WyJvdXRfb2YiLCJzZWFyY2hfdGltZV9tcyIsInN0ZXBCb2R5Il0sInBlcl9wYWdlIjo1MH0=';

    let pathPrefix, projectFilter;
    if (category === 'all') {
        pathPrefix = '';
        projectFilter = '';
    } else {
        pathPrefix = `${category}/`;
        const filterValue = `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
        projectFilter = category === 'teachers' ? `&& teachers:=${filterValue}` : ` && category:=${filterValue}`;
    }

    const link = `https://${siteDomain}/${pathPrefix}projects?projects=all`;

    const response = await got({
        method: 'get',
        url: `https://${siteDomain}/api_proxy/search/collections/projects/documents/search`,
        headers: {
            Referer: link,
            Host: siteDomain,
            'x-typesense-api-key': apiKey,
        },
        searchParams: {
            q: '*',
            query_by: 'title,stepBody,screenName',
            page: 1,
            per_page: 50,
            sort_by: 'publishDate:desc',
            include_fields: 'title,urlString,coverImageUrl,screenName,publishDate,favorites,views,primaryClassification,featureFlag,prizeLevel,IMadeItCount',
            filter_by: `featureFlag:=true${projectFilter}`,
        },
    });

    const data = response.data;

    return {
        title: 'Instructables Projects', // 项目的标题
        link, // 指向项目的链接
        description: 'Instructables Projects', // 描述项目
        language: 'en', // 频道语言
        item: data.hits.map((item) => ({
            title: item.document.title,
            link: `https://${siteDomain}/${item.document.urlString}`,
            author: item.document.screenName,
            description: `<img src="${item.document.coverImageUrl}?auto=webp&crop=1.2%3A1&frame=1&width=500" width="500">`,
            pubDate: new Date(item.document.publishDate).toUTCString(),
            category: item.document.primaryClassification,
        })),
    };
}
