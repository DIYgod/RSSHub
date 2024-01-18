const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const baseUrl = 'https://www.lightnovel.us';
    const { type, keywords, security_key = config.lightnovel.cookie } = ctx.params;
    const { data: response } = await got({
        method: 'POST',
        url: `${baseUrl}/proxy/api/search/search-result`,
        headers: {
            // 此处是为什么
            'User-Agent': config.trueUA,
        },
        json: {
            is_encrypted: 0,
            platform: 'pc',
            client: 'web',
            sign: '',
            gz: 0,
            d: {
                q: keywords,
                type: 0,
                page: 1,
                security_key,
            },
        },
    });
    const list = response.data.articles
        .map((item) => ({
            title: item.title,
            link: `${baseUrl}/cn/detail/${item.aid}`,
            pubDate: parseDate(item.time),
            author: item.author,
        }))
        .slice(0, ctx.query.limit ? Number.parseInt(ctx.query.limit) : 5);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got({
                    method: 'GET',
                    url: item.link,
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                });

                const $ = cheerio.load(response);
                item.description = $('#article-main-contents').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `轻之国度-追踪${keywords}更新-${type} `,
        link: baseUrl,
        item: items,
    };
};
