const got = require('@/utils/got');
const queryString = require('query-string');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://xueqiu.com';

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
        url: rootUrl,
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: `${rootUrl}/v4/statuses/user_timeline.json`,
        searchParams: queryString.stringify({
            user_id: id,
            type,
            source,
        }),
        headers: {
            Cookie: token,
            Referer: `${rootUrl}/u/${id}`,
        },
    });
    const data = res2.data.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

    const items = await Promise.all(
        data.map((item) =>
            ctx.cache.tryGet(item.target, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: rootUrl + item.target,
                    headers: {
                        Referer: `${rootUrl}/u/${id}`,
                        Cookie: token,
                    },
                });

                const data = JSON.parse(detailResponse.data.match(/SNOWMAN_STATUS = (.*?});/)[1]);
                item.text = data.text;

                const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                const description = item.description + retweetedStatus;

                return {
                    title: item.title ? item.title : description.replace(/<[^>]+>/g, ''),
                    description: item.text ? item.text + retweetedStatus : description,
                    pubDate: parseDate(item.created_at),
                    link: rootUrl + item.target,
                };
            })
        )
    );

    ctx.state.data = {
        title: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        link: `${rootUrl}/u/${id}`,
        description: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        item: items,
    };
};
