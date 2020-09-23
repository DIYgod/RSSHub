const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.douban.com/people/${ctx.params.uid}/notes`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.recent-replies-mod ul.comment-list li')
        .map((_, item) => {
            item = $(item);
            const p = item.find('p');
            const match = p
                .find('a')
                .attr('href')
                .match(/%2Fnote%2F(.*?)%2F%23(.*?)&type=note/);
            const nid = match[1];
            const cid = match[2];
            p.remove();
            return {
                link: `https://www.douban.com/note/${nid}/#${cid}`,
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
                    const commentsConfig = content('script').eq(16).html().replace('var _COMMENTS_CONFIG =', '');
                    const comments = JSON.parse(commentsConfig.match(/'comments':(.*?)}],/)[1] + '}]');

                    let title, description, pubDate;

                    for (const c of comments) {
                        if (c.id === item.link.split('#')[1]) {
                            (title = `${c.author.name} 于 ${c.create_time} 的回应`), (description = c.text);
                            pubDate = new Date(c.create_time + ' GMT+8').toUTCString();
                            break;
                        }
                    }

                    item.title = title;
                    item.description = description;
                    item.pubDate = pubDate;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text() + ' - 最新回应',
        link: currentUrl,
        item: items,
    };
};
