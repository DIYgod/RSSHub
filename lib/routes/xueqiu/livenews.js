'https://xueqiu.com/statuses/livenews/list.json?since_id=-1&max_id=-1&count=15';

const got = require('@/utils/got');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const res1 = await got({
        method: 'get',
        url: 'https://xueqiu.com/',
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const res2 = await got({
        method: 'get',
        url: 'https://xueqiu.com/statuses/livenews/list.json',
        searchParams: queryString.stringify({
            since_id: '-1',
            max_id: '-1',
            count: '15',
        }),
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/`,
        },
    });
    const data = res2.data.items;

    ctx.state.data = {
        title: `7x24小时快讯 - 雪球`,
        link: `https://xueqiu.com/`,
        description: `雪球7x24小时快讯`,
        item: data.map((item) => {
            const description = item.text;
            return {
                title: '',
                // title: item.title ? item.title : description.replace(/<[^>]+>/g, ''),
                description,
                // replace toUTCString with toString
                pubDate: new Date(item.created_at).toString(),
                link: String(item.target),
                // author: item.user.screen_name,
                author: '',
            };
        }),
    };
};
