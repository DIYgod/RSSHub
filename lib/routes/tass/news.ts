// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category = 'politics' } = ctx.req.param();

    const { data: categoryPage, url: link } = await got(`https://tass.com/${category}`);
    const $ = load(categoryPage);

    const sectionId = $('.container .section-page')
        .attr('ng-init')
        .match(/sectionId\s*=\s*(\d+?);/);

    const { data: response } = await got.post('https://tass.com/userApi/categoryNewsList', {
        json: {
            sectionId: sectionId[1],
            limit: 20,
            type: 'all',
        },
    });

    const list = response.newsList.map((item) => ({
        title: item.title,
        description: item.lead,
        link: `https://tass.com${item.link}`,
        pubDate: parseDate(item.date, 'X'),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.news-media img').each((_, ele) => {
                    if (ele.attribs.src) {
                        ele.attribs.src = ele.attribs.src.replaceAll('/width/1020_b9261fa1', '');
                    }
                });

                item.description = $('.news-header__lead').prop('outerHTML') + ($('.news-media').prop('outerHTML') ?? '') + $('.text-block').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link,
        language: 'en',
        image: $('head meta[property="og:image"]').attr('content'),
        icon: $('head link[rel="apple-touch-icon"]').attr('href'),
        logo: $('head link[rel="apple-touch-icon"]').attr('href'),
        item: items,
    });
};
