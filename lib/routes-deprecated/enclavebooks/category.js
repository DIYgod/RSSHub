const got = require('@/utils/got');
const host = 'https://www.enclavebooks.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const categorys = (
        await got({
            method: 'get',
            url: 'https://app.enclavebooks.cn/v2/discovery',
            headers: {
                Referer: host,
            },
        })
    ).data.result.category;

    let category_name, description;
    for (const item of categorys) {
        if (item.cateId === Number.parseInt(id)) {
            category_name = item.cateName;
            description = item.cateDescription;
            break;
        }
    }

    const list = (
        await got({
            method: 'get',
            url: `https://app.enclavebooks.cn/v1_9/getCategoryList?cateId=${id}&page=1`,
            headers: {
                Referer: host,
            },
        })
    ).data.result.data;

    const out = await Promise.all(
        list.map(async (item) => {
            const title = item.artTitle;
            const date = item.artTime;
            const author = item.artEditor;
            const itemUrl = `https://app.enclavebooks.cn/v2/article?id=${item.artId}`;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: itemUrl,
                headers: {
                    Referer: host,
                },
            });

            const description = response.data.result.artContent;

            const single = {
                title,
                link: `http://www.enclavebooks.cn/article.html?art_id=${item.artId}`,
                description,
                author,
                pubDate: new Date(date * 1000).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: `${category_name}-飞地`,
        link: host,
        description,
        item: out,
    };
};
