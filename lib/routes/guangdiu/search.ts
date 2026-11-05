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
    path: '/search/:query?',
    categories: ['shopping'],
    example: '/guangdiu/search/q=百度网盘',
    parameters: { query: '链接参数，对应网址问号后的内容' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键字搜索',
    maintainers: ['Huzhixin00'],
    handler,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const url = `${host}/${query ? `search.php?${query}` : ''}`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('a.goodname').text(),
            link: `${host}/${$(item).find('a.goodname').attr('href')}`,
        }));

    const items = await Promise.all(
        list.map(async (item) => {
            const article = await cache.tryGet(`guangdiu:search:article:${item.link}`, async () => {
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

    const keyword = new URLSearchParams(query).get('q');

    return {
        title: keyword ? `逛丢 - ${keyword}` : '逛丢',
        link: url,
        item: items,
    };
}
