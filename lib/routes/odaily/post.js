const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

const titles = {
    333: '新品',
    331: 'DeFi',
    334: 'NFT',
    332: '存储',
    330: '波卡',
    297: '行情',
    296: '活动',
};

module.exports = async (ctx) => {
    const id = ctx.params.id || '333';

    const rootUrl = 'https://www.odaily.com';
    const currentUrl = `${rootUrl}/api/pp/api/app-front/feed-stream?feed_id=${id}&b_id=&per_page=10`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.items.map((item) => ({
        title: item.title,
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
                    item.author = detailResponse.data.match(/"name":"(.*)","avatar_url"/)[1];

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${titles[id]} - Odaily星球日报`,
        link: rootUrl,
        item: items,
    };
};
