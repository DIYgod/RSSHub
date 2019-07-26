const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const url = `https://ios2.artand.cn/user1/index?tab=work&uid=${uid}`;
    const response = await got({ method: 'get', url });
    const dataUser = response.data.user;
    const dataList = response.data.list;

    const result = await Promise.all(
        dataList.map(async (item) => {
            const voItem = {
                title: item.name,
                author: dataUser.uname,
                description: '',
                pubDate: new Date(item.mtime * 1000).toUTCString(),
                link: `https://artand.cn/artid/${Number(item.id) + 100000}`, // +100000 的逻辑挺奇怪
            };

            const link = 'https://ios2.artand.cn/works/index?post_id=' + item.id;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            voItem.description = itemReponse.data.data.work.desc;

            ctx.cache.set(link, JSON.stringify(voItem));
            return Promise.resolve(voItem);
        })
    );

    ctx.state.data = {
        title: `${dataUser.uname} 的 Artand 新作`,
        link: `https://artand.cn/${dataUser.uid}`,
        description: `${dataUser.uname} 的 Artand 新作`,
        item: result,
    };
};
