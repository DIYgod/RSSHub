import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/market',
    categories: ['other'],
    example: '/tw-nongmu/market',
    radar: [
        {
            source: ['www.tw-nongmu.com/market.html', 'www.tw-nongmu.com/'],
        },
    ],
    name: '鱼价行情',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.tw-nongmu.com/market.html',
};
function getListPublicationDate(value: string): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) ?? /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(value);
    if (!match) {
        return;
    }
    const calendarDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    const date = parseDate(`${calendarDate}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().startsWith(calendarDate) ? date : undefined;
}
async function getArticleItem(item: { title: string; link: string; pubDate?: Date }): Promise<DataItem> {
    const article = await finishArticleItem({ title: item.title, link: item.link });
    delete article.mpName;
    article.description = article.description?.replace(/<p>📍发表于：[^<]*<\/p>(?=<p><a href="[^"]*">🔗️ 阅读原文<\/a><\/p>$|$)/, '').replace(/<p><a href="[^"]*">🔗️ 阅读原文<\/a><\/p>$/, '');
    const date = article.pubDate ? parseDate(article.pubDate) : undefined;
    return { ...article, pubDate: date && Number.isFinite(date.getTime()) ? date : item.pubDate };
}
async function handler() {
    const baseUrl = 'https://www.tw-nongmu.com';
    const link = `${baseUrl}/market.html`;
    const response = await ofetch(link);
    const $ = load(response);
    const list = $('.list-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: a.attr('href')!,
                pubDate: getListPublicationDate($item.find('.date').text()),
            };
        });
    const items = await pMap(list, getArticleItem, { concurrency: 3 });
    const language = $('html').attr('lang') as Language;
    return {
        title: $('head title').text(),
        link,
        language,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
