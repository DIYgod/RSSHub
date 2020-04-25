const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const response = await got({
        method: 'get',
        headers: {
            Accept: '*/*',
            Host: 'i.eastmoney.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
        },
        url: `https://i.eastmoney.com/api/ta/UserPostList?p=1&ps=20&uid=${uid}`,
    });

    const data = response.data.data.re;
    const username = data[0].post_user.user_nickname;

    ctx.state.data = {
        title: `天天基金-${username}的主页`,
        link: `https://i.eastmoney.com//${uid}`,
        description: `${username} 的 动态`,
        item: data.map((item) => ({
            title: item.post_title,
            description: item.post_content,
            pubDate: item.post_display_time,
            link: `http://guba.eastmoney.com/news,${item.code_name},${item.post_id}.html`,
        })),
    };
};
