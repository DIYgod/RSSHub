const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')();

module.exports = async (ctx) => {
    const getUsernameFromUID = (uid) =>
        ctx.cache.tryGet('luogu:username:' + uid, async () => {
            const { data } = await got(`https://www.luogu.com.cn/user/${uid}?_contentOnly=1`);
            return data.currentData.user.name;
        });

    const uid = ctx.params.uid;
    const name = await getUsernameFromUID(uid);
    const { data: response } = await got(`https://www.luogu.com.cn/api/feed/list?user=${uid}`);

    const data = response.feeds.result;

    ctx.state.data = {
        title: `${name} 的洛谷动态`,
        link: `https://www.luogu.com.cn/user/${uid}#activity`,
        allowEmpty: true,
        item: data.map((item) => ({
            title: item.content,
            description: md.render(item.content),
            pubDate: parseDate(item.time, 'X'),
            author: name,
            link: `https://www.luogu.com.cn/user/${uid}#activity`,
        })),
    };
};
