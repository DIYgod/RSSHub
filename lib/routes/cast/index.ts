import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Response } from 'got';
const baseUrl = 'https://www.cast.org.cn';

interface ResponseData<T> extends Response {
    data: T;
}

export default async (ctx) => {
    const { column, subColumn, category } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();
    let link = `${baseUrl}/${column}/${subColumn}`;
    if (category) {
        link += `/${category}/index.html`;
    }
    const { data: indexData } = (await got.get(link)) as ResponseData<string>;

    const $ = load(indexData);

    const buildUnitScript = $('script').filter((_, el) => $(el).attr('parsetype') === 'bulidstatic');
    const queryData = JSON.parse(buildUnitScript.attr('querydata')?.replace(/'/g, '"') ?? '{}');
    queryData.paramJson = `{"pageNo":1,"pageSize":${limit}}`;
    const pageTitle = $('head title').text();

    const queryUrl = `${baseUrl}/${buildUnitScript.attr('url')}`;

    const { data } = (await got.get(queryUrl, {
        searchParams: new URLSearchParams(queryData),
    })) as ResponseData<{ data: { html: string } }>;

    ctx.set('data', {
        title: pageTitle,
        link,
        image: 'https://www.cast.org.cn/favicon.ico',
        item: await Promise.all(
            $(data.data.html)
                .find('li')
                .toArray()
                .map((el) => {
                    const item = $(el);
                    const title = item.find('a');
                    const articleUrl = `${baseUrl}${title.attr('href')}`;

                    return cache.tryGet(articleUrl, async () => {
                        const res = (await got.get(articleUrl)) as ResponseData<string>;
                        const article = load(res.data);
                        const pubDate = timezone(parseDate(article('meta[name=PubDate]').attr('content')!, 'YYYY-MM-DD HH:mm'), +8);

                        return {
                            title: title.text(),
                            pubDate,
                            description: article('#zoom').html(),
                            link: `${baseUrl}${title.attr('href')}`,
                        };
                    });
                })
        ),
    });
};
