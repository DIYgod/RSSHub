// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 5;
    const link = `https://syosetu.org/novel/${id}`;
    const $ = load(await get(link));

    const title = $('span[itemprop="name"]').text();
    const description = $('div.ss:nth-child(2)').text();

    const chapter_list = $('tr[bgcolor]')
        .map((_, chapter) => {
            const $_chapter = $(chapter);
            const chapter_link = $_chapter.find('a');
            return {
                title: chapter_link.text(),
                link: chapter_link.attr('href'),
                pubDate: timezone(parseDate($_chapter.find('nobr').text(), 'YYYYMMDD HH:mm'), +9),
            };
        })
        .toArray()
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

    ctx.set('data', {
        title,
        description,
        link,
        language: 'ja',
        item: item_list,
    });
};

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
