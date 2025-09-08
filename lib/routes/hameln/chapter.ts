import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

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
    description: `Eg: [https://syosetu.org/novel/264928](https://syosetu.org/novel/264928)`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 5;
    const link = `https://syosetu.org/novel/${id}`;
    const $ = load(await get(link));

    const title = $('span[itemprop="name"]').text();
    const description = $('div.ss:nth-child(2)').text();

    const chapter_list = $('tr[bgcolor]')
        .toArray()
        .map((chapter) => {
            const $_chapter = $(chapter);
            const chapter_link = $_chapter.find('a');
            return {
                title: chapter_link.text(),
                link: chapter_link.attr('href'),
                pubDate: timezone(parseDate($_chapter.find('nobr').text(), 'YYYYMMDD HH:mm'), +9),
            };
        })
        .sort((a, b) => (a.pubDate <= b.pubDate ? 1 : -1))
        .slice(0, limit);

    const item_list = await Promise.all(
        chapter_list.map((chapter) => {
            chapter.link = `${link}/${chapter.link}`;
            return cache.tryGet(chapter.link, async () => {
                const content = load(await get(chapter.link));
                chapter.description = content('#honbun').html();
                return chapter;
            });
        })
    );

    return {
        title,
        description,
        link,
        language: 'ja',
        item: item_list,
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
