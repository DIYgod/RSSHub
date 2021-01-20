const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.type = ctx.params.type || 'volley';

    let currentUrl = `https://sports.sina.com.cn/others/${ctx.params.type}.shtml`,
        query = 'ul.list2 li a';

    if (ctx.params.type === 'ufc') {
        currentUrl = 'http://roll.sports.sina.com.cn/s_ufc_all/index.shtml';
        query = '#d_list ul li span a';
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $(query)
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
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

                    item.description = content('#artibody').html();
                    item.title = content('meta[property="og:title"]').attr('content');
                    item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content')).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').text().split('_')[0]} - 新浪体育`,
        link: currentUrl,
        item: items,
    };
};
