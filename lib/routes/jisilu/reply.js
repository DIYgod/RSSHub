const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const rootUrl = 'https://www.jisilu.cn';
    const currentUrl = `${rootUrl}/people/${user}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const id = response.data.match(/var PEOPLE_USER_ID = '(.*)'/)[1];
    const name = response.data.match(/<title>(.*) 的个人主页 - 集思录<\/title>/)[1];

    const apiUrl = `${rootUrl}/people/ajax/user_actions/uid-${id}__actions-201__page-0`;
    const apiResponse = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(apiResponse.data);

    const list = $('.aw-item')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('.aw-hide-txt a');

            return {
                author: name,
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('.aw-text-color-999').text()).toUTCString(),
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

                    content('.aw-dynamic-topic-more-operate').remove();

                    item.description = content('.aw-dynamic-topic-content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${name}的回复 - 集思录`,
        link: currentUrl,
        item: items,
    };
};
