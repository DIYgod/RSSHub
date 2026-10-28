import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

export const route: Route = {
    path: '/sy/whyw',
    categories: ['government'],
    example: '/gov/wuhan/sy/whyw',
    parameters: {},
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
            source: ['wuhan.gov.cn/sy/whyw/', 'wuhan.gov.cn/whyw', 'wuhan.gov.cn/'],
        },
    ],
    name: '要闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'wuhan.gov.cn/sy/whyw/',
};

async function handler() {
    const rootUrl = 'http://www.wuhan.gov.cn';
    const currentUrl = `${rootUrl}/sy/whyw/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.articleList li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const date = copyElements($item.find('.time')).find('script').remove().end().text().trim();
            const pubDate = date ? timezone(parseDate(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'], true), 8) : undefined;
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                const date = content('meta[name="PubDate"]').attr('content');
                const pubDate = date ? timezone(parseDate(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], true), 8) : undefined;

                item.description = content('.article .TRS_UEDITOR').first().html() || content('.view').html();
                item.author = content('meta[name=ContentSource]').attr('content');
                item.pubDate = pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : item.pubDate;

                return item;
            })
        )
    );

    return {
        title: `${$('h2').text()} - 武汉市人民政府`,
        link: currentUrl,
        item: items,
    };
}
