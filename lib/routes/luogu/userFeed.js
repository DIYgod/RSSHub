const got = require('@/utils/got');

module.exports = async (ctx) => {
    const getUsernameFromUID = async (uid) => {
        const key = 'luogu-username-from-uid-' + uid;
        let name = await ctx.cache.get(key);
        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://www.luogu.com.cn/user/${uid}?_contentOnly=1`,
            });
            name = nameResponse.data.currentData.user.name;
            ctx.cache.set(key, name);
        }
        return name;
    };

    const uid = ctx.params.uid;
    const name = await getUsernameFromUID(uid);
    const response = await got({
        method: 'get',
        url: `https://www.luogu.com.cn/api/feed/list?user=${uid}`,
    });
    const data = response.data.feeds.result;

    ctx.state.data = {
        title: `${name} 的洛谷动态`,
        link: `https://www.luogu.com.cn/user/${uid}#activity`,
        allowEmpty: true,
        item: data.map((item) => ({
            title: item.content,
            description: item.content,
            pubDate: new Date(item.time * 1000).toUTCString(),
            link: `https://www.luogu.com.cn/user/${uid}#activity`,
            guid: item.id,
        })),
    };
};
