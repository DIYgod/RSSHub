import cache from '@/utils/cache';
import got, { type Response } from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.cast.org.cn';

interface ResponseData<T> extends Response {
    data: T;
}

async function parsePage(html: string) {
    return await Promise.all(
        load(html)('li')
            .toArray()
            .map((el) => {
                const title = load(el)('a');
                let articleUrl = title.attr('href');

                if (articleUrl?.startsWith('http')) {
                    return {
                        title: title.text(),
                        link: title.attr('href'),
                    };
                }
                articleUrl = `${baseUrl}${title.attr('href')}`;

                return cache.tryGet(articleUrl, async () => {
                    const res = (await got.get(articleUrl!)) as ResponseData<string>;
                    const article = load(res.data);
                    const pubDate = timezone(parseDate(article('meta[name=PubDate]').attr('content')!, 'YYYY-MM-DD HH:mm'), +8);

                    return {
                        title: title.text(),
                        pubDate,
                        description: article('#zoom').html(),
                        link: articleUrl,
                    };
                });
            })
    );
}

export default async (ctx) => {
    const { column, subColumn, category } = ctx.req.param();
    const { limit = 10 } = ctx.req.query();
    let link = `${baseUrl}/${column}/${subColumn}`;
    if (category) {
        link += `/${category}/index.html`;
    }
    const { data: indexData } = (await got.get(link)) as ResponseData<string>;

    const $ = load(indexData);

    let items: any[] = [];

    // 新闻-视频首页特殊处理
    if (column === 'xw' && subColumn === 'SP' && !category) {
        items = await parsePage(indexData);
    } else {
        const buildUnitScript = $('script[parseType="bulidstatic"]');
        const queryUrl = `${baseUrl}${buildUnitScript.attr('url')}`;
        const queryData = JSON.parse(buildUnitScript.attr('querydata')?.replace(/'/g, '"') ?? '{}');
        queryData.paramJson = `{"pageNo":1,"pageSize":${limit}}`;

        const { data } = (await got.get(queryUrl, {
            searchParams: new URLSearchParams(queryData),
        })) as ResponseData<{ data: { html: string } }>;

        items = await parsePage(data.data.html);
    }

    const pageTitle = $('head title').text();

    ctx.set('data', {
        title: pageTitle,
        link,
        image: 'https://www.cast.org.cn/favicon.ico',
        item: items,
    });
};
