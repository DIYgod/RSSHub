const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://qq88.info';
    const currentUrl = `${rootUrl}/?cat=${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.entry-title a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: Date.parse(item.parent().next().find('.mh-meta-date').eq(-1).text().split('：')[1]),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    const links = content('.entry-content').find('a[download]');

                    item.enclosure_type = 'video/mp4';
                    item.enclosure_url = `${links.eq(-1).attr('href')}`;
                    item.description = `<video controls><source src="${item.enclosure_url}"></video><br>`;

                    links.each(function () {
                        item.description += `<li><a href="${content(this).attr('href')}">${content(this).text()}</a></li>`;
                    });

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('.page-title').text() || '首页'} - 秋爸日字`,
        link: currentUrl,
        item: items,
    };
};
