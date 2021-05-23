const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const keyword_encode = encodeURIComponent(keyword);
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
        data.map(async (item) => {
            const link = `https://sspai.com/post/${item.id}`;
            let description;
            const key = item.id;
            const value = await ctx.cache.get(key);
            if (value) {
                description = value;
            } else {
                const response = await got({ method: 'get', url: link, headers: { Referer: host } });
                const $ = cheerio.load(response.data);
                description = $('div.content.wangEditor-txt.clock').html();
                ctx.cache.set(key, description);
            }
            return {
                title: item.title.trim(),
                description: description,
                link: link,
                pubDate: new Date(item.released_at * 1000).toUTCString(),
                author: item.author.nickname,
            };
        })
    );
    ctx.state.data = {
        title: `#${keyword} - 少数派`,
        link: host,
        description: `${keyword} 更新推送 `,
        item: items,
    };
};
