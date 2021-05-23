const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://opser.api.dgtle.com/v1/app/index?page=1',
    });

    const article_items = response.data.items.filter((item) => item.type in { 1: '', 4: '' });

    const items = await Promise.all(
        article_items.map(async (item) => {
            let title = '';
            let olink = ''; // 原始链接
            let dlink = ''; // description 链接
            let category = '';
            let description = '';

            if (1 === item.type) {
                title = item.title;
                dlink = `https://opser.api.dgtle.com/v1/article/view/${item.aid}`;
                olink = `https://www.dgtle.com/article-${item.aid}-1.html`;
                category = '文章';
                description = await ctx.cache.tryGet(dlink, async () => {
                    const resp = await got.get(dlink);
                    return resp.data.content;
                });
            } else if (4 === item.type) {
                title = item.summary;
                dlink = `https://opser.api.dgtle.com/v1/feeds/inst/${item.aid}`;
                olink = `https://www.dgtle.com/inst-${item.aid}-1.html`;
                category = '兴趣动态';
                description = await ctx.cache.tryGet(dlink, async () => {
                    const resp = await got.get(dlink);

                    return resp.data.imgs_url.reduce((content, dimg) => (content += `<img src=${dimg.path.split('?')[0]} />`), resp.data.content);
                });
            }

            return Promise.resolve({
                title: title,
                description,
                pubDate: new Date(item.send_at * 1000).toUTCString(),
                link: olink,
                category: category,
                author: item.author.username,
            });
        })
    );

    ctx.state.data = {
        title: '数字尾巴 - 首页',
        link: 'https://www.dgtle.com',
        description: '数字尾巴首页内容',
        item: items,
    };
};
