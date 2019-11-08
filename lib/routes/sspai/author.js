const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=20&author_ids=${id}&include_total=false`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    let author_nickname = '';
    let author_id = 0;
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

            // 将作者名称和id赋值给nickname和id
            author_nickname = item.author.nickname;
            author_id = item.author.id;

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
        title: `${author_nickname} - 少数派作者`,
        link: `https://sspai.com/user/${author_id}/posts`,
        description: `${author_nickname} 更新推送 `,
        item: items,
    };
};
