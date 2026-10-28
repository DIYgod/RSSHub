import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'description' | 'author' | 'category'>> {
    const response = await ofetch(link);
    const $ = load(response);
    const pressCenter = $('.presscenter');
    const tagRow = pressCenter.find('.tag-row');
    const category = tagRow
        .find('.fa-bookmark')
        .parent()
        .find('a')
        .toArray()
        .map((a) => $(a).text());
    const author = tagRow.find('.fa-user').parent().find('a').text();

    pressCenter.children('h1').first().remove();
    pressCenter.children('.tag-row, .press-choose-post, hr.space').remove();

    return { description: pressCenter.html()?.trim(), category, author };
}

export const route: Route = {
    path: '/cn/presscenter/news',
    categories: ['new-media'],
    example: '/trendforce/cn/presscenter/news',
    radar: [
        {
            source: ['www.trendforce.cn/presscenter/news'],
        },
    ],
    name: '产业洞察',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.trendforce.cn/presscenter/news',
};

async function handler() {
    const baseUrl = 'https://www.trendforce.cn';
    const link = `${baseUrl}/presscenter/news`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.list-items .list-item')
        .toArray()
        .filter((item) => $(item).find('h3 a.title-link').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('h3 a.title-link');
            const date = $item.find('h4').text().trim();
            return {
                title: a.find('strong').text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                description: $item.find('p').text()?.trim(),
                pubDate: date ? timezone(parseDate(date, 'D MMMM YYYY'), 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`trendforce:cn:detail:${item.link}`, () => fetchArticleDetails(item.link));
            return { ...item, description: details.description, author: details.author, category: details.category };
        },
        { concurrency: 3, stopOnError: false }
    );

    const language = $('html').attr('lang') as Language;
    const imageUrl = $('link[rel="apple-touch-icon-precomposed"][sizes="152x152"]').attr('href');

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        language,
        image: imageUrl ? new URL(imageUrl, link).href : undefined,
        item: items,
    };
}
