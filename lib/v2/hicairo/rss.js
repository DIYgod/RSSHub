const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://www.hicairo.com';
    const response = await got(`${url}/feed.php`);
    const list = response.data;
    ctx.state.data = {
        title: 'HiFeng'Blog',
        link: url,
        description: 'HiFeng'Blog - 全部文章',
        item: list.map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: parseDate(item.pubDate),
            description: item.description,
        })),
    };
};
