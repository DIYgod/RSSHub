// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export default async (ctx) => {
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
    ctx.set('data', {
        title: `东方财富网 - 搜索'${keyword}'`,
        link,
        item: items,
    });
};
