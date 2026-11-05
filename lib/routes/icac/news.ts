import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import utils from './utils';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['government'],
    example: '/icac/news/sc',
    parameters: { lang: 'Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese) and `tc`(Traditional Chinese)' },
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
            source: ['icac.org.hk/:lang/press/index.html'],
            target: '/news/:lang',
        },
    ],
    name: 'Press Releases',
    maintainers: ['linbuxiao', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const BASE_WITH_LANG = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(`${BASE_WITH_LANG}/press/index.html`);
    const $ = load(res.data);

    const list = $('.pressItem')
        .toArray()
        .map((e): DataItem => {
            const c = $(e);
            return {
                title: c.find('.hd').text(),
                link: new URL(c.find('a').first().attr('href')!, utils.BASE_URL).href,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const c = load(detailResponse.data);
                c('.btn_download').remove();
                c('.col-3-wrap.clearfix.pressPhoto div').removeAttr('class');
                const des = c('.pressContent').html();
                const thumbs = c('.pressPhoto, .lightGallery').html() ?? '';
                const pubDate = parseDate(c('h3').first().text().trim(), ['YYYY年MM月DD日', 'YYYY年MM月D日', 'YYYY年M月DD日', 'YYYY年M月D日', 'YYYY-MM-DD', 'YYYY-MM-D', 'YYYY-M-DD', 'YYYY-M-D'], true);
                if (Number.isFinite(pubDate.getTime())) {
                    item.pubDate = timezone(pubDate, 8);
                }
                item.description = des + thumbs;
                return item;
            })
        )
    );
    return {
        title: 'ICAC 新闻公布',
        link: `${BASE_WITH_LANG}/press/index.html`,
        description: 'ICAC 新闻公布',
        language: ctx.req.param('lang') ? utils.LANG_TYPE[ctx.req.param('lang')] : utils.LANG_TYPE.sc,
        item: items,
    };
}
