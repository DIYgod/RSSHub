const got = require('@/utils/got');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const url = 'https://www.bh3.com/index.php/news/_more';
    let type = ctx.params.type;

    const typeMap = {
        latest: '',
        news: '新闻',
        notice: '公告',
        activity: '活动',
        strategy: '攻略',
    };

    type = typeMap[type] || '';

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
            'x-requested-with': 'XMLHttpRequest',
        },
        searchParams: queryString.stringify({
            begin: new Date(),
            type: type,
        }),
    });

    const data = response.data.data.data;

    const title = `崩坏3-${type ? type : '最新'}`;

    ctx.state.data = {
        title: title,
        link: `https://www.bh3.com/index.php/news/?type=${type}`,
        description: title,
        item: data.map((item) => {
            const pubDate = new Date(item.create_time);
            pubDate.setTime(pubDate.getTime() + 8 * 60 * 60 * 1000);
            return {
                title: item.title_short ? item.title_short : item.title,
                description: item.summary,
                pubDate: pubDate.toUTCString(),
                link: `https://www.bh3.com/index.php/news/${item.id}`,
            };
        }),
    };
};
