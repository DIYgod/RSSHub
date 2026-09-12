import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
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
    name: 'Voice of America (VOA)',
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

async function handler(ctx: Context) {
    const { language, channel = '' } = ctx.req.param();

    const baseURL = baseURLs[language];
    if (!baseURL) {
        throw new Error('The language specified does not exist');
    }

    const response = await ofetch(`${baseURL}api/${channel}`);
    const $ = load(response);

    const list = $('item')
        .toArray()
        .map((e) => {
            const $e = $(e);
            return {
                title: $e.find('title').text(),
                link: $e.find('guid').text(),
                pubDate: parseDate($e.find('pubDate').text()),
                description: $e.find('description').text(),
            };
        })
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const content = await ofetch(item.link);
                const description = load(content);
                description('.wsw__embed').remove();

                const articleContent = description('div#article-content div').first().html();
                if (articleContent) {
                    item.description = description('div.cover-media') + articleContent;
                }

                return item;
            })
        )
    );

    return {
        title: $('channel title').first().text(),
        link: baseURL,
        item: items,
    };
}
