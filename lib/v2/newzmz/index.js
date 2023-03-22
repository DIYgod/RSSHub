const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = parseInt(ctx.params.category || '1');

    const rootUrl = 'http://newzmz.com';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/index.html`,
    });

    const $ = cheerio.load(response.data);
    const target = $('.rowMod').eq(category);

    const links = await Promise.all(
        target
            .find('.slides li a')
            .map((_, item) => {
                item = $(item);

                return {
                    title: item.text(),
                    link: `${rootUrl}${item.attr('href')}`,
                };
            })
            .get()
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const resourceResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const $ = cheerio.load(resourceResponse.data);

                    item.link = $('.addgz').attr('href').replace('http:', 'https:');
                    item.pubDate = parseDate(
                        $('.duration')
                            .not('.upday')
                            .text()
                            .replace(/更新时间：/, '')
                    );

                    return item;
                })
            )
    );

    const items = await Promise.all(
        links.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('img, .link-name').remove();

                content('a[title]').each(function () {
                    content(this).text(content(this).attr('title'));
                });

                item.description = content('.faq--area').html();
                item.enclosure_type = 'application/x-bittorrent';
                item.enclosure_url = content('a[title="磁力链下载"]').attr('href');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${target.find('.row-header-title').text()} - NEW字幕组`,
        link: rootUrl,
        item: items,
    };
};
