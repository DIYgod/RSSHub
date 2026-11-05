import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseURLs = {
    cantonese: 'https://www.voacantonese.com/',
    chinese: 'https://www.voachinese.com/',
    tibetan: 'https://www.voatibetan.com/',
};

export const route: Route = {
    path: '/:language/:channel?',
    categories: ['traditional-media'],
    example: '/voanews/cantonese/zprtie-ttp',
    parameters: { language: '語言', channel: '頻道，可於官網獲取' },
    name: 'News',
    maintainers: ['zphw'],
    handler,
    description: `透過提取全文，以獲得更好的閱讀體驗

\`语言\`

| 粵語      | 中文    | 藏語    |
| --------- | ------- | ------- |
| cantonese | chinese | tibetan |

\`频道\`

可於各語言官網聚合新聞處 (如 <https://www.voacantonese.com/rssfeeds>) 獲取

例如 \`https://www.voacantonese.com/api/zyrtyequty\` 將對應 \`/voanews/cantonese/zyrtyequty\``,
};

async function fetchArticle(link: string): Promise<Pick<DataItem, 'description'>> {
    const content = await ofetch(link);
    const description = load(content);
    description('.wsw__embed').each((_, element) => {
        const embed = description(element);
        const media = embed.find('audio, video, iframe');
        media.filter('audio, video').attr('controls', '');
        if (media.length) {
            embed.replaceWith(media);
        }
    });

    const articleContent = description('div#article-content div').first().html();
    return { description: articleContent ? description('div.cover-media') + articleContent : undefined };
}

async function handler(ctx: Context) {
    const { language, channel = '' } = ctx.req.param();

    const baseURL = baseURLs[language];
    if (!baseURL) {
        throw new Error('The language specified does not exist');
    }

    const response = await ofetch(`${baseURL}api/${channel}`, { responseType: 'text' });
    const $ = load(response, { xml: true });

    const list = $('item')
        .toArray()
        .map((e) => {
            const $e = $(e);
            const publicationTime = $e.find('pubDate').text();
            return {
                title: $e.find('title').text(),
                link: $e.find('guid').text(),
                pubDate: publicationTime && Number.isFinite(Date.parse(publicationTime)) ? parseDate(publicationTime) : undefined,
                description: $e.find('description').text(),
                author: $e.find('author').text() || undefined,
                image: $e.find('enclosure[type^="image/"]').first().attr('url') || undefined,
                category: $e
                    .find('category')
                    .toArray()
                    .map((category) => $(category).text()),
            };
        })
        .filter((item) => item.link);

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`voa:article:v2:${item.link}`, () => fetchArticle(item.link));
            return { ...item, description: detail.description || item.description };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('channel title').first().text(),
        link: $('channel > link').text() || baseURL,
        description: $('channel > description').text() || undefined,
        image: $('channel > image > url').text() || undefined,
        // The shared Language union does not include the RSS source's ISO 639 code for Cantonese.
        language: $('channel > language').text() === 'yue' ? ('yue' as Language) : undefined,
        item: items,
    };
}
