const got = require('@/utils/got');
const queryString = require('query-string');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type || 10;
    const source = type === '11' ? '买卖' : '';
    const typename = {
        10: '全部',
        0: '原发布',
        2: '长文',
        4: '问答',
        9: '热门',
        11: '交易',
    };

    const res1 = await got({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: 'https://xueqiu.com/v4/statuses/user_timeline.json',
        searchParams: queryString.stringify({
            user_id: id,
            type,
            source,
        }),
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });
    const data = res2.data.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

    ctx.state.data = {
        title: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        link: `https://xueqiu.com/u/${id}`,
        description: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        item: data.map((item) => {
            const description = item.description + (item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '');
            return {
                title: item.title ? item.title : description.replace(/<[^>]+>/g, ''),
                description,
                pubDate: parseDate(item.created_at),
                link: `https://xueqiu.com${item.target}`,
            };
        }),
    };
};
