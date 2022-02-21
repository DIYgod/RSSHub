const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.nogizaka46.com/s/n46/api/list/blog',
    });

    const list = JSON.parse(response.data.slice(4).slice(0, -2)).data;

    ctx.state.data = {
        allowEmpty: true,
        title: '乃木坂46 公式ブログ',
        link: 'https://www.nogizaka46.com/s/n46/diary/MEMBER',
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                link: item.link,
                pubDate: parseDate(item.date),
                author: item.name,
                description: item.text,
            })),
    };
};
