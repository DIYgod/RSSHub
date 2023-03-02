const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const defaults = require('./defaults');
const shortcuts = require('./shortcuts');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const site = ctx.params[0] ?? 'news';
    if (!isValidHost(site)) {
        throw Error('Invalid site');
    }

    let items;
    let category = ctx.params[1] ?? (defaults.hasOwnProperty(site) ? defaults[site] : '');
    category = shortcuts.hasOwnProperty(site) ? (shortcuts[site].hasOwnProperty(category) ? shortcuts[site][category] : category) : category;

    const rootUrl = `https://${site}.dlut.edu.cn`;
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    if (site === 'panjin') {
        items = $('a.news').slice(0, -4);
    } else {
        $('.Next, .rjxw_left, .pb_sys_common').remove();
        items = $('.txt, .itemlist, .wall, .list, .list01, .ny_list, .rjxw_right, .rj_yjs_con, .c_hzjl_list1, .winstyle67894, .winstyle80936, .winstyle50738, #lili').find('a');
    }

    items = items
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const dateRegex = /(\d{4}[-/年]\d{2}[-/月]\d{2})/;

            let dateMatch = item.parent().text().match(dateRegex);
            if (!dateMatch) {
                dateMatch = item.parent().parent().text().match(dateRegex);
            }

            return {
                title: item.text() === '' ? item.next().text() : item.text(),
                link: /^http/.test(item.attr('href')) ? item.attr('href') : `${rootUrl}/${item.attr('href').replace(/^[./]+/, '')}`,
                pubDate: parseDate(dateMatch ? dateMatch[1].replace(/年|月/g, '-') : new Date().toString()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.v_news_content, .conbox').html();
                } catch (err) {
                    // Fo example: http://dutdice.dlut.edu.cn/nry.jsp?urltype=news.NewsContentUrl&wbtreeid=1006&wbnewsid=9820
                    // do nothing to the cases which require fetching resources from the Intranet :P
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
