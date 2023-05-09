const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://csgo.5eplay.com/';
    const currentUrl = `${rootUrl}api/article?page=1&type_id=0&time=0&order_by=0`;

    const { data: response } = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.list.map((item) => ({
        title: item.title,
        description: item.title + (item.images?.[0] ? `<img src="${item.images[0]}" referrerpolicy="no-referrer">` : ''),
        pubDate: parseDate(item.dateline * 1000),
        link: item.jump_link,
    }));

    ctx.state.data = {
        title: '5EPLAY',
        link: 'https://csgo.5eplay.com/article',
        item: items,
    };
};
