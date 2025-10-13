const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const { site = 'www' } = ctx.params;
    let { category = site === 'www' ? '59476' : '' } = ctx.params;
    category = site === 'cpc' && category === '24h' ? '87228' : category;

    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    if (!isValidHost(site)) {
        throw Error('Invalid site');
    }
    const rootUrl = `http://${site}.people.com.cn`;
    const currentUrl = new URL(`GB/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response, 'gbk'));

    $('em').remove();
    $('.bshare-more, .page_n, .page').remove();

    $('a img, h3 img').each((_, e) => {
        $(e).parent().remove();
    });

    let items = $('.p6, div.p2j_list, div.headingNews, div.ej_list_box, .fl, .leftItem')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href').trim();

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : new URL(link.replace(/^\.\./, ''), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link, {
                        responseType: 'buffer',
                    });

                    const data = iconv.decode(detailResponse, 'gbk');
                    const content = cheerio.load(data);

                    content('.paper_num, #rwb_tjyd').remove();

                    item.description = content('.rm_txt_con, .show_text').html();
                    item.pubDate = timezone(parseDate(data.match(/(\d{4}年\d{2}月\d{2}日\d{2}:\d{2})/)[1], 'YYYY年MM月DD日 HH:mm'), +8);
                } catch (err) {
                    item.description = err;
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
