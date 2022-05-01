const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const keyword_encode = encodeURIComponent(decodeURIComponent(keyword));
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=50&has_tag=1&tag=${keyword_encode}&include_total=false`;
    const host = `https://beta.sspai.com/tag/${keyword_encode}`;
    const resp = await got({
        method: 'get',
        url: api_url,
        headers: {
            Referer: host,
        },
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            let description;
            const key = `sspai: ${item.id}`;
            return ctx.cache.tryGet(key, async () => {
                const response = await got({ method: 'get', url: link, headers: { Referer: host } });
                description = response.data.data.body;

                return {
                    title: item.title.trim(),
                    description,
                    link: `https://sspai.com/post/${item.id}`,
                    pubDate: parseDate(item.released_at * 1000),
                    author: item.author.nickname,
                };
            });
        })
    );
    ctx.state.data = {
        title: `#${keyword} - 少数派`,
        link: host,
        description: `${keyword} 更新推送 `,
        item: items,
    };
};
