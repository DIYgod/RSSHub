// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const utils = require('./utils');
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const BASE_WITH_LANG = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(`${BASE_WITH_LANG}/press/index.html`);
    const $ = load(res.data);

    const list = $('.pressItem.clearfix')
        .map((_, e) => {
            const c = load(e);
            return {
                title: c('.hd a').text(),
                link: `${utils.BASE_URL}${c('.hd a').attr('href')}`,
            };
        })
        .get();
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
    ctx.set('data', {
        title: 'ICAC 新闻公布',
        link: `${BASE_WITH_LANG}/press/index.html`,
        description: 'ICAC 新闻公布',
        language: ctx.req.param('lang') ? utils.LANG_TYPE[ctx.req.param('lang')] : utils.LANG_TYPE.sc,
        item: items,
    });
};
