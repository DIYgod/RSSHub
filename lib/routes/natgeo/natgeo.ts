// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// https://www.natgeomedia.com//article/

async function loadContent(link) {
    const { data } = await got(link);
    const $ = load(data);
    const dtStr = $('.content-title-area')
        .find('h6')
        .first()
        .html()
        .replaceAll(/&nbsp;/gi, ' ')
        .trim();

    let description = $('article').first().html() + $('article').eq(1).html();
    if (/photo/.test(link)) {
        description = $('#content-album').html() + description;
    }
    return {
        title: $('title').text(),
        pubDate: parseDate(dtStr, 'MMM. DD YYYY'),
        description,
    };
}

export default async (ctx) => {
    const type = ctx.req.param('type') ?? '';
    const url = `https://www.natgeomedia.com/${ctx.req.param('cat')}/${type}`;
    const res = await got(url);
    const $ = load(res.data);

    const urlList = $('.article-link-w100')
        .find('.read-btn')
        .toArray()
        .map((i) => ({
            link: $(i).find('a[href]').first().attr('href'),
        }));

    const out = await Promise.all(
        urlList.map(async (i) => {
            const link = i.link;
            const single = {
                link,
            };
            const other = await cache.tryGet(link, () => loadContent(link));
            return { ...single, ...other };
        })
    );
    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: out,
    });
};
