const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const BASE_WITH_LANG = utils.langBase(ctx.params.lang);
    const res = await got.get(`${BASE_WITH_LANG}/press/index.html`);
    const $ = cheerio.load(res.data);

    const list = $('.pressItem.clearfix')
        .map((_, e) => {
            const c = cheerio.load(e);
            return {
                title: c('.hd a').text(),
                link: `${utils.BASE_URL}${c('.hd a').attr('href')}`,
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const c = cheerio.load(detailResponse.data);
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
    ctx.state.data = {
        title: 'ICAC 新闻公布',
        link: `${BASE_WITH_LANG}/press/index.html`,
        description: 'ICAC 新闻公布',
        language: ctx.params.lang ? utils.LANG_TYPE[ctx.params.lang] : utils.LANG_TYPE.sc,
        item: items,
    };
};
