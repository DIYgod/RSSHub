const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '0';
    const order = ctx.params.order ?? '1';

    const rootUrl = 'https://user.guancha.cn';
    const currentUrl = `${rootUrl}/${id === '0' ? 'main/index-list.json?' : 'topic/post-list?topic_id=' + id}&page=1&order=${order}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list-item h4 a, ul.home li .list-item h4 a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}&page=0`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.pubDate = parseRelativeDate(content('.time1').text());
                item.author = content('.user-main h4 a').first().text();
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
