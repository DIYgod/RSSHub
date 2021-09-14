const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'xwdt';

    const rootUrl = 'http://yjsy.hljucm.net';
    const currentUrl = `${rootUrl}/index/${category}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.postlist a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace(/\.\./, '')}`,
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

                const content = cheerio.load(detailResponse.data);

                item.description = content('#vsb_newscontent').html();
                item.pubDate = timezone(parseDate(content('.timestyle56043').text()), +8);

                for (const file of detailResponse.data.match(/<span>附件【<a href="(.*)"><span>(.*)<\/span><\/a>】<\/span>/g)) {
                    const { link, name } = file.match(/【<a href="(?<link>.*)"><span>(?<name>.*)<\/span><\/a>】/).groups;
                    item.description += `<a href="${link}">${name}</a>`;
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
