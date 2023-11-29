const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.lightnovel.us';
    const { type, security_key, keywords } = ctx.params;
    const { data: response } = await got({
        method: 'POST',
        url: `${baseUrl}/proxy/api/search/search-result`,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Node/12.14.1',
        },
        data: JSON.stringify({
            is_encrypted: 0,
            platform: `pc`,
            client: `web`,
            sign: ``,
            gz: 0,
            d: {
                q: keywords,
                type: 0,
                page: 1,
                security_key: String(security_key),
            },
        }),
    });
    const items = [];
    for (const key in response.data) {
        if (key === type && type === 'articles') {
            items.values = response.data[key].map((item) => ({
                title: item.title,
                link: `${baseUrl}/cn/detail/${item.aid}`,
                description: `<img src=${item.banner}/>`,
                pubDate: parseDate(item.time),
                author: item.author,
            }));
        } else if (key === type && type === 'collections') {
            items.values = response.data[key].map((item) => ({
                title: item.name,
                link: `${baseUrl}/cn/series/${item.sid}`,
                description: `<img src=${item.banner}/>`,
                pubDate: parseDate(item.last_time),
                author: item.author,
            }));
        }
    }
    ctx.state.data = {
        title: `轻之国度 - 更新 - ${type}`,
        link: baseUrl,
        item: items.values,
    };
};
