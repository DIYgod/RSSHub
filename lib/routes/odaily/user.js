const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.odaily.com';
    const currentUrl = `${rootUrl}/service/feed_stream/user/${id}?b_id=10&per_page=10`;

    let author = '';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.items.data.map((item) => ({
        title: item.title,
        summary: item.summary,
        link: `${rootUrl}/post/${item.entity_id}`,
        pubDate: timezone(new Date(item.published_at), +8),
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data.match(/"content":"(.*)","extraction_tags":/)[1]);

                    content('img').each(function () {
                        content(this).attr('src', content(this).attr('src').replace(/\\"/g, ''));
                    });

                    item.description = content.html();
                    item.author = author = detailResponse.data.match(/"name":"(.*)","avatar_url"/)[1];

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${author} - Odaily星球日报`,
        link: `${rootUrl}/user/${id}`,
        item: items,
    };
};
