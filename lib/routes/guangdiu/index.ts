import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

const host = 'https://guangdiu.com';

export const route: Route = {
    path: '/:query?',
    categories: ['shopping'],
    example: '/guangdiu/k=daily',
    parameters: { query: '链接参数，对应网址问号后的内容' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国内折扣 / 海外折扣',
    maintainers: ['Fatpandac'],
    handler,
    description: `::: tip
海外折扣: [\`/guangdiu/k=daily&c=us\`](https://rsshub.app/guangdiu/k=daily\\&c=us)
:::`,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const url = query === 'c=us' ? `${host}/?c=us` : `${host}/${query ? `cate.php?${query}` : ''}`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('a.goodname').text(),
            link: new URL($(item).find('div.iteminfoarea > h2 > a').attr('href')!, host).href,
        }));

    const items = await Promise.all(
        list.map(async (item) => {
            const article = await cache.tryGet(`guangdiu:index:article:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const description = $('#dabstract').html()! + $('a.dgotobutton').html('前往购买');
                const publishTime = copyElements($('.dinfoweibo').first()).children(':not(.latesttime)').remove().end().text().trim();
                const pubDate = /^\d{4}-\d{2}-\d{2}/.test(publishTime) ? timezone(parseDate(publishTime), 8) : publishTime && !/^\d{1,2}-\d{1,2}\s/.test(publishTime) ? parseRelativeDate(publishTime) : undefined;

                return { description, pubDate };
            });
            return { ...item, ...article };
        })
    );

    return {
        title: `逛丢 - ${query.includes('c=us') ? '海外' : '国内'}`,
        link: url,
        item: items,
    };
}
