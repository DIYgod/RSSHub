import { load } from 'cheerio';
import { escapeAttribute } from 'entities';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.mplus.org.hk';

export const route: Route = {
    path: '/content/:section?',
    example: '/mplus/content/magazine',
    name: '雜誌、展覽與今日呈獻',
    categories: ['travel'],
    maintainers: ['DIYgod'],
    parameters: { section: 'magazine（雜誌，預設）、exhibitions（展覽）或 today（今日呈獻）。' },
    radar: [{ source: ['www.mplus.org.hk/tc/:section'], target: '/content/:section' }],
    handler,
};

function getItem(item: DataItem) {
    return cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const content = $('.PagesMagazineArticle-body, .PagesExhibitionsDetail-story');
        content.find('script, style, button, svg, img[src^="data:"]').remove();
        const image = $('meta[property="og:image"]').attr('content');
        item.description = `${image ? `<img src="${escapeAttribute(image)}">` : ''}${content.html() || ''}`;
        const metadata = $('.PagesMagazineArticleHeroInfo-published').text();
        const date = metadata.match(/\d{4}年\d{1,2}月\d{1,2}日/);
        if (date) {
            item.pubDate = parseDate(date[0], 'YYYY年M月D日');
            item.author = metadata.match(/\/\s*(.+)/)?.[1];
        }
        item.category = $('.PagesMagazineArticleHeroInfo-footerTags a')
            .toArray()
            .map((tag) => $(tag).text());
        return item;
    });
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'magazine';
    if (!['magazine', 'exhibitions', 'today'].includes(section)) {
        throw new InvalidParameterError('Choose magazine, exhibitions or today.');
    }
    const link = `${baseUrl}/tc/${section}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const selectors = section === 'magazine' ? '.CommonMagazineItem-link[href]' : 'a.CommonExhibitionsItem[href], .PagesTodayHeroCarousel a[href]';
    const seen = new Set<string>();
    const items = $(selectors)
        .toArray()
        .map((element): DataItem => {
            const card = $(element);
            const date = card.find('.CommonTitleColors-titleText').first().text();
            return {
                title: card.find('h3, .PagesTodayHeroCarousel-itemTitle').first().text(),
                link: new URL(card.attr('href')!, baseUrl).href,
                pubDate: /\d{4}年/.test(date) ? parseDate(date, 'YYYY年M月D日') : undefined,
            };
        })
        .filter((item) => {
            if (seen.has(item.link!)) {
                return false;
            }
            seen.add(item.link!);
            return true;
        })
        .slice(0, Number(ctx.req.query('limit')) || 20);
    return { title: $('title').text(), link, language: 'zh-TW' as const, item: await pMap(items, getItem, { concurrency: 3 }) };
}
