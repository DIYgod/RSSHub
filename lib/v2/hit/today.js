const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const host = 'https://today.hit.edu.cn';
    const category = ctx.params.category;

    const response = await got(host + '/category/' + category, {
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.paragraph li')
        .toArray()
        .map((e) => ({
            link: new URL($('span span a', e).attr('href'), host).href,
            title: $('span span a', e).text(),
            author: $('div a', e).attr('hreflang', 'zh-hans').text(),
            pubDate: timezone(parseDate($('span span a', e).attr('href').split('/').slice(-4, -1).join(), 'YYYYMMDD'), 8),
        }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link, {
                        headers: {
                            Referer: host,
                        },
                    });

                    const $ = cheerio.load(response.data);
                    item.pubDate = timezone(parseDate($('.left-attr.first').text().trim()), 8);
                    item.description =
                        $('.article-content').html() &&
                        $('.article-content')
                            .html()
                            .replace(/src="\//g, `src="${new URL('.', host).href}`)
                            .replace(/href="\//g, `href="${new URL('.', host).href}`)
                            .trim();
                } catch (e) {
                    // intranet
                    item.description = '请进行统一身份认证后查看全文';
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: host + '/category/' + category,
        item: out,
    };
};
