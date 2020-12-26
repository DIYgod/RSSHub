const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const id = ctx.params.id || '0';
    const order = ctx.params.order || '1';

    const rootUrl = 'https://user.guancha.cn';
    const currentUrl = `${rootUrl}/${id === '0' ? 'main/index-list.json?' : 'topic/post-list?topic_id=' + id}&page=1&order=${order}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list-item h4 a, ul.home li .list-item h4 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                    item.pubDate = date(content('.time1').text(), 8);
                    item.author = content('.user-main h4 a').eq(0).text();
                    item.description = content('.article-txt-content').html();

                    return item;
                })
        )
    );

    $('h1.title span').remove();

    ctx.state.data = {
        title: `观察者网 - ${id === '0' ? '风闻' : $('h1.title').text()}`,
        link: currentUrl,
        item: items,
    };
};
