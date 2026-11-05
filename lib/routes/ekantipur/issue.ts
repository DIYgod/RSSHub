import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:channel?',
    categories: ['traditional-media'],
    example: '/ekantipur/news',
    parameters: { channel: 'Find it in the ekantipur.com menu or pick from the list below:' },
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
            source: ['ekantipur.com/:channel'],
            target: '/:channel',
        },
    ],
    name: 'Full Article RSS',
    maintainers: ['maniche04'],
    handler,
    description: `Channels:

| समाचार | अर्थ / वाणिज्य | विचार     | खेलकुद   | उपत्यका    | मनोरञ्जन        | फोटोफिचर          | फिचर     | विश्व   | ब्लग  |
| ---- | ---------- | ------- | ------ | -------- | ------------- | -------------- | ------- | ----- | ---- |
| news | business   | opinion | sports | national | entertainment | photo\\_feature | feature | world | blog |`,
};

const baseUrl = 'https://ekantipur.com';

const parseArticleDate = (date?: string) => {
    if (!date) {
        return;
    }
    const parsed = parseDate(date);
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date) ? timezone(parsed, 5.75) : parsed;
};

async function handler(ctx) {
    const { channel = 'news' } = ctx.req.param();
    const response = await ofetch<{ html: string }>('https://api.ekantipur.com/kantipur/v4/web/category', {
        method: 'POST',
        responseType: 'json',
        headers: { Referer: `${baseUrl}/${channel}` },
        body: new URLSearchParams({
            json: 'true',
            deviceSource: 'desktop',
            currentslug: channel,
            offset: '0',
            requestDate: '',
            requestLastNewsDate: '',
            enNews: '0',
            hdnLN: '',
        }),
    });
    if (typeof response.html !== 'string') {
        throw new TypeError('The official category API did not provide its first-page news list.');
    }
    const $ = load(response.html);
    const list = $('.category-description, article.op-essay .info')
        .toArray()
        .map((element): DataItem & { link: string } => {
            const content = $(element);
            const anchor = content.find('h2 a, h3 a').first();
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, baseUrl).href,
                author: content.find('.author-name, .author a').text(),
                category: channel,
            };
        });
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch<string>(item.link);
                const $ = load(response);
                const metadata = $('script[type="application/ld+json"]')
                    .toArray()
                    .flatMap((element) => JSON.parse($(element).text()))
                    .find((data) => data['@type'] === 'NewsArticle');
                const content = $('.news-section-wrap-story .news-inner-wrapper').first();
                const cover = $('.image-section-wrap figure').first();
                if (!content.length && !cover.length) {
                    throw new Error('The official article page did not provide its main content.');
                }
                content.find('.saman-samachar, .saman-news-wrapper, script, style').remove();
                content
                    .add(cover)
                    .find('img[data-src]')
                    .each((_, element) => {
                        $(element).attr('src', $(element).attr('data-src')!);
                        $(element).removeAttr('data-src');
                    });
                const tags = $('.news-section-wrap-story a[href*="/tag/"]')
                    .toArray()
                    .map((element) => $(element).text());
                const authors = metadata?.author ? (Array.isArray(metadata.author) ? metadata.author : [metadata.author]) : [];
                return {
                    ...item,
                    title: metadata?.headline || item.title,
                    author: authors.map((author) => author.name).join(' / ') || item.author,
                    description: (cover.length ? $.html(cover) : '') + (content.html() || ''),
                    pubDate: parseArticleDate(metadata?.datePublished),
                    updated: parseArticleDate(metadata?.dateModified),
                    category: tags.length ? tags : item.category,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: `Ekantipur - ${channel}`,
        link: `${baseUrl}/${channel}`,
        language: 'ne' as const,
        item: items,
    };
}
