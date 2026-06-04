const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://www.mihoyo.com/news/getNotice';
    let type = ctx.params.type;

    const typeArr = ['new', 'version', 'gach', 'event'];

    if (!typeArr.includes(type)) {
        type = typeArr[0];
    }

    const index = typeArr.indexOf(type) + 1 || 1;

    const response = await got({
        method: 'post',
        url,
        headers: {
            Referer: url,
            'x-requested-with': 'XMLHttpRequest',
        },
    });

    const data = response.data.data[type] || [];

    const title = `崩坏2-${type}`;

    ctx.state.data = {
        title,
        link: 'http://www.mihoyo.com/news',
        description: title,
        item: data.map((item) => {
            const pubDate = new Date(item.time);
            pubDate.setTime(pubDate.getTime() + 8 * 60 * 60 * 1000);
            return {
                title: item.title,
                description: item.title,
                pubDate: pubDate.toUTCString(),
                link: `http://www.mihoyo.com/news?para=${index}_${item.id}`,
            };
        }),
    };
};
