import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

// https://www.natgeomedia.com/article/

async function loadContent(link) {
    const data = await ofetch(link);
    const $ = load(data);
    const dtStr = $('.content-title-area')
        .find('h6')
        .first()
        .text()
        .replaceAll(/&nbsp;/gi, ' ')
        .trim();

    $('.splide__arrows, .slide-control, [class^="ad-"], style').remove();

    let description = ($('article').eq(0).html() ?? '') + ($('article').eq(1).html() ?? '');
    if (/photo|gallery/.test(link)) {
        description = $('#content-album').html() + description;
    }
    return {
        title: $('h1.content-title').text().trim(),
        pubDate: parseDate(dtStr),
        description,
        category: $('.content-tag a')
            .toArray()
            .map((i) => $(i).text()),
        link,
        image: $('link[rel="image_src"]').attr('href'),
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
            source: ['natgeomedia.com/:cat/:type', 'natgeomedia.com/:cat/', 'natgeomedia.com/'],
            target: '/:cat/:type?',
        },
    ],
    name: '分类',
    maintainers: ['fengkx'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? '';
    const url = `https://www.natgeomedia.com/${ctx.req.param('cat')}/${type}`;
    const res = await ofetch(url);
    const $ = load(res);

    const urlList = $('.article-link-content h4')
        .toArray()
        .filter((i) => $(i).closest('.article-link-right').length === 0) // 移除右側熱門精選
        .map((i) => ({
            link: $(i).find('a[href]').first().attr('href'),
        }))
        .filter((i) => i.link);

    const out = await Promise.all(urlList.map((i) => cache.tryGet(i.link!, () => loadContent(i.link))));

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: 'https://www.natgeomedia.com/img/app_icon.png',
        item: out,
    };
}
