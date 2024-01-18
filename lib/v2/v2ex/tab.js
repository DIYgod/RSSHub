const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const tabid = ctx.params.tabid;
    const host = 'https://v2ex.com';
    const pageUrl = `${host}/?tab=${tabid}`;

    const response = await got({
        method: 'get',
        url: pageUrl,
    });

    const $ = cheerio.load(response.data);
    const links = $('span.item_title > a')
        .toArray()
        .slice(0, ctx.query.limit ? Number.parseInt(ctx.query.limit) : 10)
        .map((link) => `${host}${$(link).attr('href').replace(/#.*$/, '')}`);

    const items = await Promise.all(
        links.map((link) =>
            ctx.cache.tryGet(`v2ex-${link}`, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const $ = cheerio.load(response.data);
                const list = $('[id^="r_"]').toArray();
                const replyContent = list
                    .map((item) => {
                        const post = $(item);
                        const content = post.find('.reply_content').html();
                        const author = post.find('.dark').first().text();
                        const no = post.find('.no').text();
                        return `<p><div>#${no}: <i>${author}</i></div><div>${content}</div></p>`;
                    })
                    .join('');

                return {
                    title: $('.header h1').text(),
                    link,
                    description: `${$('div.topic_content').html()}<div>${replyContent}</div>`,
                    author: $('div.header > small > a').text(),
                };
            })
        )
    );

    ctx.state.data = {
        title: `V2EX-${tabid}`,
        link: pageUrl,
        description: `V2EX-tab-${tabid}`,
        item: items,
    };
};
