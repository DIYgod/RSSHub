import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, parseContent } from './utils';

function parseItems(tid: string, $: CheerioAPI) {
    return $('.tr1:nth-child(1)')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const content = parseContent($item.html());
            const footer = $item.next();
            const pid = footer.find('.tipad a[title]').attr('id')?.slice(2);

            return {
                title: $('head title').text(),
                description: content,
                author: $item.find('b .s3').first().text() || $item.find('b').first().text(),
                pubDate: parseDate(String(footer.find('span[data-timestamp]').data('timestamp')), 'X'),
                link: `${baseUrl}/read.php?tid=${tid}${pid ? `&pid=${pid}` : ''}`,
            };
        });
}

export const route: Route = {
    path: '/post/:tid',
    categories: ['multimedia'],
    example: '/t66y/post/3286088',
    parameters: { tid: '帖子 id, 可在帖子 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '帖子跟踪',
    maintainers: ['cnzgray'],
    handler,
    description: `::: tip
帖子 id 查找办法:

打开想跟踪的帖子，比如：\`https://t66y.com/htm_data/20/1811/3286088.html\` 其中 \`3286088\` 就是帖子 id。
:::`,
};

async function handler(ctx: Context) {
    const { tid } = ctx.req.param();
    const response = await ofetch.raw(`${baseUrl}/read.php?tid=${tid}`, { responseType: 'text' });
    if (!response._data) {
        throw new Error('The requested thread returned no content.');
    }
    const link = response.url;
    const $ = load(response._data);

    const items = parseItems(tid, $);

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
