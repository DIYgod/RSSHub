const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const site = ctx.params[0] ?? 'www';
    let category = ctx.params[1] ?? (site === 'www' ? '59476' : '');
    category = site === 'cpc' && category === '24h' ? '87228' : category;

    const rootUrl = `http://${site}.people.com.cn`;
    const currentUrl = `${rootUrl}/GB/${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    $('em').remove();
    $('.bshare-more, .page_n, .page').remove();

    $('a img').each(function () {
        $(this).parent().remove();
    });

    let items = $('.p6, div.p2j_list, div.headingNews, div.ej_list_box, .fl')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href').trim();

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : `${rootUrl}${link.replace(/^\.\./, '')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });

                    const data = iconv.decode(detailResponse.data, 'gbk');
                    const content = cheerio.load(data);

                    content('.paper_num, #rwb_tjyd').remove();

                    item.description = content('.rm_txt_con, .show_text').html();
                    item.pubDate = timezone(
                        parseDate(
                            data
                                .match(/(\d{4}年\d{2}月\d{2}日\d{2}:\d{2})/)[1]
                                .replace(/年|月/g, '-')
                                .replace(/日/, ' ')
                        ),
                        +8
                    );
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
