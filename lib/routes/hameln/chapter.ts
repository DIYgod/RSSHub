import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/chapter/:id',
    categories: ['reading'],
    example: '/hameln/chapter/264928',
    parameters: { id: 'Novel id, can be found in URL' },
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
            source: ['syosetu.org/novel/:id'],
        },
    ],
    name: 'chapter',
    maintainers: ['huangliangshusheng'],
    handler,
    description: 'Eg: <https://syosetu.org/novel/264928>',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = getRouteLimit(ctx, 5);
    const link = `https://syosetu.org/novel/${id}`;
    const html = await get(link);
    const $ = load(html);

    const title = $('span[itemprop="name"]').text();
    const description = $('div.ss:nth-child(2)').text();

    const chapterList = $('tr[bgcolor]')
        .toArray()
        .map((chapter): DataItem => {
            const $chapter = $(chapter);
            const chapterLink = $chapter.find('a');
            return {
                title: chapterLink.text(),
                link: chapterLink.attr('href'),
                pubDate: timezone(parseDate($chapter.find('nobr').text(), 'YYYYMMDD HH:mm'), 9),
            };
        });
    const candidates = (ctx.req.query('sorted') === 'false' ? chapterList : chapterList.toSorted((a, b) => Number(b.pubDate) - Number(a.pubDate))).slice(0, limit);

    const itemList = await Promise.all(
        candidates.map((chapter) => {
            chapter.link = `${link}/${chapter.link}`;
            return cache.tryGet(chapter.link, async () => {
                const html = await get(chapter.link);
                const content = load(html);
                chapter.description = content('#honbun').html();
                return chapter;
            });
        })
    );

    return {
        title,
        description,
        link,
        language: 'ja' as const satisfies Language,
        item: itemList,
    };
}

const get = async (url) => {
    const response = await got({
        method: 'get',
        url,
        headers: {
            cookie: 'over18=off',
        },
    });

    return response.data;
};
