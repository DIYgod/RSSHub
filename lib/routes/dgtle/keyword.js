const got = require('@/utils/got');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const url = `https://www.dgtle.com/search?search_word=${encodeURIComponent(keyword)}`;

    const response = await got({
        method: 'get',
        url: `https://www.dgtle.com/search/sale?search_word=${encodeURIComponent(keyword)}&page=1`,
        headers: {
            Referer: url,
        },
    });

    const list = response.data.data.dataList;

    ctx.state.data = {
        title: `数字尾巴 - 闲置 - ${keyword}`,
        link: url,
        item: list.map((item) => ({
            title: item.title.replace(/<.*?>/g, ''),
            author: item.author.username,
            description: `<p>价格: ¥${item.price}</p><p>地址: ${item.address}</p><p>${item.content}</p><img src="${item.cover}" style="max-width: 100%;"/>`,
            pubDate: new Date(item.created_at * 1000),
            link: `https://www.dgtle.com/sale-${item.id}-1.html`,
        })),
    };
};
