const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?device=h5&platform=web',
        form: true,
        body: { comic_id: ctx.params.id },
    }).catch(function(e) {
        console.error(e);
    });

    const data = response.data.data;

    console.log(response.data);

    ctx.state.data = {
        title: `哔哩哔哩漫画 - ${data.title}`,
        link: `https://manga.bilibili.com/m/detail/mc${ctx.params.id}`,
        description: data.evaluate,
        item: data.ep_list
            .sort((a, b) => (a.ord > b.ord ? 1 : a.ord < b.ord ? -1 : 0))
            .map((item) => ({
                title: `第${item.short_title}话${item.pay_mode ? `[$${item.pay_gold}]` : ''}`,
                description: `<h1>第${item.short_title}话</h1><h2>${data.title}</h2>${item.pay_mode ? `<span>价格：${item.pay_gold}漫币</span>` : ''}`,
                guid: item.id,
                link: `https://manga.bilibili.com/m/mc${ctx.params.id}/${item.id}`,
            })),
    };
};
