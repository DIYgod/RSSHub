const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type || 'announcement';
    const count = 10;
    const page = 1;
    const typename = {
        announcement: '公告',
        news: '自选股新闻',
        research: '研报',
    };
    const source = typename[type];

    const res1 = await axios({
        method: 'get',
        url: `https://xueqiu.com/S/${id}`,
    });
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

    const $ = cheerio.load(res1.data); // 使用 cheerio 加载返回的 HTML
    const html_title = $('title').text();
    const stock_name = html_title.split(' ')[0];

    const res2 = await axios({
        method: 'get',
        url: 'https://xueqiu.com/statuses/stock_timeline.json',
        params: {
            symbol_id: id,
            source: source,
            count: count,
            page: page,
        },
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });

    const data = res2.data.list;
    ctx.state.data = {
        title: `${stock_name} 的${source}`,
        link: `https://xueqiu.com/S/${id}`,
        description: `${stock_name} 的${source}`,
        item: data.map((item) => ({
            title: item.title !== '' ? item.title : item.description.split('<a')[0],
            description: item.description,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://xueqiu.com${item.target}`,
        })),
    };
};
