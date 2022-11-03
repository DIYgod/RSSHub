const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const size = ctx.query.limit ?? '20';

    const rootUrl = 'https://xueqiu.com';
    const currentUrl = `${rootUrl}/today`;
    const apiUrl = `${rootUrl}/statuses/hot/listV2.json?since_id=-1&size=${size}`;

    const firstResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const token = firstResponse.headers['set-cookie'].join(',').match(/(xq_a_token=.*?;)/)[1];

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: rootUrl,
            Cookie: token,
        },
    });

    let items = response.data.items.map((item) => {
        item = item.original_status;

        return {
            title: item.title || item.rawTitle || item.description.replace(/<(.*?)>/g, ''),
            link: `${rootUrl}${item.target}`,
            pubDate: parseDate(item.created_at),
            author: item.user.screen_name,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: rootUrl,
                        Cookie: token,
                    },
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.article__bd__detail').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '今日话题 - 雪球',
        link: currentUrl,
        item: items,
    };
};
