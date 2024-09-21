import { Route } from '@/types';
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

export const route: Route = {
    path: '/:cat/:type?',
    categories: ['travel'],
    example: '/natgeo/environment/article',
    parameters: { cat: '分类', type: '类型, 例如`https://www.natgeomedia.com/environment/photo/`对应 `cat`, `type` 分别为 `environment`, `photo`' },
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
            source: ['natgeomedia.com/:cat/:type', 'natgeomedia.com/'],
            target: '/:cat/:type',
        },
    ],
    name: '分类',
    maintainers: ['fengkx'],
    handler,
};

async function handler(ctx) {
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
    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
