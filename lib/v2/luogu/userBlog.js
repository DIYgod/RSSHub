const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const rsp = await got.get(`https://www.luogu.com.cn/blog/${username}/_sitemap`);
    const $ = cheerio.load(rsp.data);
    const blogTitle = $('title').text();
    const blogLink = $('.am-alert > a').attr('href');

    const metas = $('.am-u-md-12 .lg-table-big')
        .map(function () {
            const a = $(this).find('a').first();
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        })
        .get();
    const item = await Promise.all(
        metas.map((meta) =>
            ctx.cache.tryGet(meta.link, async () => {
                const rsp = await got.get(meta.link);
                const $ = cheerio.load(rsp.data);
                const dateRegex = /(\d{4}[-]\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
                const dateMatch = $.text().match(dateRegex);
                return {
                    title: meta.title,
                    link: meta.link,
                    pubDate: dateMatch ? timezone(parseDate(dateMatch[1]), +8) : undefined,
                    description: $('#article-content').html(),
                };
            })
        )
    );

    ctx.state.data = {
        title: blogTitle,
        link: blogLink,
        item,
    };
};
