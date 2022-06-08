const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

async function getUserId(slug) {
    const response = await got({
        method: 'get',
        url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
        headers: {
            Referer: `https://sspai.com/u/${slug}/posts`,
        },
    });

    if (response.data.error !== 0) {
        throw 'User Not Found';
    }

    return response.data.data.id;
}

module.exports = async (ctx) => {
    const id = ctx.params.id.match(/^\d+$/) ? ctx.params.id : await getUserId(ctx.params.id);
    const api_url = `https://sspai.com/api/v1/articles?offset=0&limit=20&author_ids=${id}&include_total=false`;
    const resp = await got({
        method: 'get',
        url: api_url,
    });
    const data = resp.data.list;
    const author_slug = data[0].author.slug;
    const author_nickname = data[0].author.nickname;
    const items = await Promise.all(
        data.map((item) => {
            const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second`;
            let description = '';

            const key = `sspai: ${item.id}`;
            return ctx.cache.tryGet(key, async () => {
                const response = await got(link);
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
        title: `${author_nickname} - 少数派作者`,
        link: `https://sspai.com/u/${author_slug}/posts`,
        description: `${author_nickname} 更新推送 `,
        item: items,
    };
};
