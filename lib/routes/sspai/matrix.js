const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const api_url = 'https://sspai.com/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false';
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const items = await Promise.all(
        data.map(async (item) => {
            const link = `https://sspai.com/post/${item.id}`;
            let description = '';

            const key = `sspai: ${item.id}`;
            const value = await ctx.cache.get(key);

            if (value) {
                description = value;
            } else {
                const response = await got({ method: 'get', url: link });
                const $ = cheerio.load(response.data);
                description = $('#app > div.postPage.article-wrapper > div.article-detail > article > div.article-body').html();
                ctx.cache.set(key, description);
            }

            return {
                title: item.title.trim(),
                description,
                link,
                pubDate: new Date(item.released_at * 1000),
                author: item.author.nickname,
            };
        })
    );

    ctx.state.data = {
        title: '少数派 -- Matrix',
        link: 'https://sspai.com/matrix',
        description: '少数派 -- Matrix',
        item: items,
    };
};
