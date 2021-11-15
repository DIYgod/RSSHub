import got from '~/utils/got.js';

export default async (ctx) => {
    // 传入参数
    const username = String(ctx.params.username);

    // 发起第二个HTTP GET请求，用于获取该用户被关注总数
    const response2 = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const {
        data
    } = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}/watchers.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });
    const data2 = response2.data;

    ctx.state.data = {
        // 源标题
        title: `${username}'s Watcher List`,
        // 源链接
        link: `https://www.furaffinity.net/watchlist/to/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Watcher List`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item,
            // 正文
            description: `${username} was watched by ${item} <br> Totall: ${data2.watchers.count} `,
            // 链接
            link: `https://www.furaffinity.net/user/${item}/`,
            // 由于源API未提供日期，故无pubDate
        })),
    };
};
