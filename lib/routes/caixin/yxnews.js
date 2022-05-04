const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://k.caixin.com/app/v1/list?productIdList=8,28&uid=&unit=1&name=&code=&deviceType=&device=&userTag=&p=1&c=20',
        headers: {
            Referer: `http://k.caixin.com/web/`,
            Host: 'k.caixin.com',
        },
    });

    const data = response.data.data.list;
    const items = await Promise.all(
        data.map((item) => ({
            title: item.title,
            description: item.text,
            link: `http://k.caixin.com/web/detail_${item.oneline_news_code}`,
            pubDate: new Date(item.ts),
            author: '财新一线',
        }))
    );

    ctx.state.data = {
        title: `财新网 - 财新一线新闻`,
        link: `http://k.caixin.com/`,
        description: `财新网 - 财新一线新闻`,
        item: items,
    };
};
