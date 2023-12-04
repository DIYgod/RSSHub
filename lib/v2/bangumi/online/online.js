const got = require('@/utils/got');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');

module.exports = async (ctx) => {
    const url = 'https://api.bangumi.online/serve/home';

    const response = await got.post(url);

    const list = response.data.data.list;

    const items = list.map((item) => ({
        title: `${item.title.zh ? item.title.zh : item.title.ja} - 第 ${item.volume} 集`,
        description: art(path.join(__dirname, '../templates/online/image.art'), {
            src: `https:${item.cover}`,
            alt: `${item.title_zh} - 第 ${item.volume} 集`,
        }),
        link: `https://bangumi.online/watch/${item.vid}`,
        pubDate: parseDate(item.create_time),
    }));

    ctx.state.data = {
        title: 'アニメ新番組',
        link: 'https://bangumi.online',
        item: items,
    };
};
