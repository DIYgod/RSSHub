const got = require('@/utils/got');

module.exports = async (ctx) => {
    const res1 = await got({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: 'https://xueqiu.com/statuses/hots.json',
        params: {
            a: '1',
            count: '10',
            page: '1',
            scope: 'day',
            type: 'status',
            meigu: '0',
        },
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/`,
        },
    });
    const data = res2.data;

    ctx.state.data = {
        title: `热帖 - 雪球`,
        link: `https://xueqiu.com/`,
        description: `雪球热门帖子`,
        item: data.map((item) => {
            const description = item.text;
            return {
                title: item.title ? item.title : description.replace(/<[^>]+>/g, ''),
                description: item.text,
                pubDate: new Date(item.created_at).toUTCString(),
                link: `https://xueqiu.com${item.target}`,
                author: item.user.screen_name,
            };
        }),
    };
};
