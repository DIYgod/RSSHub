const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://sspai.com/column/${id}`;

    const desApi = `https://sspai.com/api/v1/special_columns/${id}`;
    let response = await axios({
        method: 'get',
        url: desApi,
        headers: {
            Referer: link,
        },
    });

    const result = response.data;
    const title = result.title;
    const description = result.intro;

    const api = `https://sspai.com/api/v1/articles?offset=0&limit=10&special_column_ids=${id}&include_total=false`;
    response = await axios({
        method: 'get',
        url: api,
        headers: {
            Referer: link,
        },
    });

    const list = response.data.list;

    const out = await Promise.all(
        list.map(async (item) => {
            const title = item.title;
            const date = item.created_at;
            const itemUrl = `https://sspai.com/post/${item.id}`;
            const author = item.author.nickname;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('div.content.wangEditor-txt.clock').html();

            const single = {
                title: title,
                link: itemUrl,
                author: author,
                description: description,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `少数派专栏-${title}`,
        link: link,
        description: description,
        item: out,
    };
};
