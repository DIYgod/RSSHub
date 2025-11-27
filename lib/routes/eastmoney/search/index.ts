import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/eastmoney/search/web3',
    parameters: { keyword: '关键词，可以设置为自己需要检索的关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索',
    maintainers: ['drgnchan'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const link = `https://so.eastmoney.com/News/s?KeyWord=${keyword}`;
    const body = {
        uid: '',
        keyword,
        type: ['cmsArticleWebOld'],
        client: 'web',
        clientType: 'web',
        clientVersion: 'curr',
        params: {
            cmsArticleWebOld: {
                searchScope: 'default',
                sort: 'default',
                pageIndex: 1,
                pageSize: 10,
                preTag: '<em>',
                postTag: '</em>',
            },
        },
    };
    const cb = `jQuery${('3.5.1' + Math.random()).replaceAll(/\D/g, '')}_${Date.now()}`;

    const url = `https://search-api-web.eastmoney.com/search/jsonp`;

    const response = await got(url, {
        searchParams: {
            cb,
            param: JSON.stringify(body),
        },
    });
    const data = response.data;

    const extractedText = data.match(/jQuery\d+_\d+\((.*)\)/)[1];

    const obj = JSON.parse(extractedText);
    const arr = obj.result.cmsArticleWebOld;

    const items = arr.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: timezone(parseDate(item.date), 8),
        link: item.url,
        author: item.mediaName,
    }));
    return {
        title: `东方财富网 - 搜索'${keyword}'`,
        link,
        item: items,
    };
}
