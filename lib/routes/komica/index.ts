import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const parsePost = ($: CheerioAPI, post: Cheerio<Element>, base: string): DataItem => {
    const no = post.find('.qlink').attr('data-no');
    const image = post.find('.file-thumb img').attr('data-sync-original');
    const dateMatch = post
        .find('.now')
        .text()
        .match(/(\d{4}\/\d{2}\/\d{2})\(.\) (\d{2}:\d{2}:\d{2})/);

    return {
        title: post.find('.title').text(),
        link: `${base}pixmicat.php?res=${no}`,
        guid: `komica:${base}${no}`,
        author: post.find('.name').text(),
        pubDate: dateMatch ? timezone(parseDate(`${dateMatch[1]} ${dateMatch[2]}`, 'YYYY/MM/DD HH:mm:ss'), 8) : undefined,
        category: post
            .find('.category a[href*="mode=category"]')
            .toArray()
            .map((a) => $(a).text()),
        description: (image ? (image.endsWith('.mp4') ? `<video src="${image}" controls></video><br>` : `<img src="${image}"><br>`) : '') + (post.find('.quote').html() ?? ''),
    };
};

const handler = async (ctx: Context): Promise<Data> => {
    const { host, board, category } = ctx.req.param();
    if (!isValidHost(host)) {
        throw new InvalidParameterError('Invalid host');
    }
    const limit = Number(ctx.req.query('limit') ?? '30');
    const baseUrl = `https://${host}.komica1.org/${board}/`;

    const listUrl = `${baseUrl}pixmicat.php?mode=module&load=mod_threadlist${category ? `&c=${encodeURIComponent(category)}` : ''}`;
    const html = await ofetch(listUrl);
    const $ = load(html);

    const links = $('tr[class^="ListRow"] a[href^="pixmicat.php?res="]')
        .toArray()
        .map((a) => new URL($(a).attr('href')!, baseUrl).href)
        .slice(0, limit);

    const items = await Promise.all(
        links.map((link) =>
            cache.tryGet(link, async () => {
                const threadHtml = await ofetch(link);
                const $$ = load(threadHtml);
                return parsePost($$, $$('.threadpost'), baseUrl);
            })
        )
    );

    return {
        title: `Komica - ${$('h1').text()}${category ? ` - ${category}` : ''}`,
        link: listUrl,
        language: 'zh-TW',
        item: items,
    };
};

export const route: Route = {
    path: '/:host/:board/:category?',
    name: '討論板',
    url: 'komica1.org',
    maintainers: ['TonyRL'],
    handler,
    example: '/komica/gita/00b/動畫',
    parameters: {
        host: '子網域，即討論板網址中 `*.komica1.org` 的第一段，如 `gita`',
        board: '討論板路徑，如 `00b`',
        category: '類別（列表模式），如 `動畫`、`漫畫`、`掛圖`、`新番捏他`、`新番實況`、`模型`、`軍武`；留空為整個版面',
    },
    description: '例如綜合避難所 <https://gita.komica1.org/00b/> 對應 `/komica/gita/00b`，其「動畫」列表對應 `/komica/gita/00b/動畫`。',
    categories: ['bbs'],
    radar: [
        {
            source: ['komica1.org/:board/'],
            target: '/:host/:board',
        },
    ],
};
