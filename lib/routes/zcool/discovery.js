const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const query = ctx.params.query || '0!0!0!0!0!!!!2!-1!1';

    const rootUrl = `https://www.zcool.com.cn/discover/${query}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('.work-list-box > .card-box')
        .map((_, item) => {
            item = $(item);
            return {
                link: item.find('.card-info-title a[title]').attr('href'),
                author: item.find('.user-avatar').find('a').attr('title'),
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

                    item.title = content('h2').text();
                    item.pubDate = new Date(content('.title-time').attr('title').split('创建时间：')[1]).toUTCString();
                    item.description = item.link.indexOf('article') < 0 ? content('.work-content-wrap').html() : content('.article-content-wraper').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `站酷 - ${query}`,
        link: rootUrl,
        item: items,
    };
};
