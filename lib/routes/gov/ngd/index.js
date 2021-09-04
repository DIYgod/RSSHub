const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const slug = ctx.params.slug || 'xwzx-ywdt-index';

    const rootUrl = 'http://www.ngd.org.cn';
    const currentUrl = `${rootUrl}/${slug.replace(/-/g, '/')}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.gp-ellipsis a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${currentUrl.replace('/index.htm', '')}/${item.attr('href')}`,
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
                const info = content('.articleAuthor').text().split('|');

                item.author = info[0].replace('来源：', '');
                item.description = content('.gp-article').html();
                item.pubDate = new Date(info[info.length - 1].replace('发布时间：', '')).toUTCString();

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
