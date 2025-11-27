import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    maintainers: ['linbuxiao, TonyRL'],
    handler,
};

async function handler(ctx) {
    const BASE_WITH_LANG = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(`${BASE_WITH_LANG}/press/index.html`);
    const $ = load(res.data);

    const list = $('.pressItem.clearfix')
        .toArray()
        .map((e) => {
            const c = load(e);
            return {
                title: c('.hd a').text(),
                link: `${utils.BASE_URL}${c('.hd a').attr('href')}`,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const c = load(detailResponse.data);
                c('.btn_download').remove();
                c('.col-3-wrap.clearfix.pressPhoto div').removeAttr('class');
                const des = c('.pressContent.full').html();
                const thumbs = c('.col-3-wrap.clearfix.pressPhoto').html() ?? '';
                item.pubDate = parseDate(decodeURI(c('.date').text().trim()), ['YYYY年MM月DD日', 'YYYY年MM月D日', 'YYYY年M月DD日', 'YYYY年M月D日'], true);
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
