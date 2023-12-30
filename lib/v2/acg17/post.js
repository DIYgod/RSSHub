const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://acg17.com';

module.exports = async (ctx) => {
    const response = await got(`${host}/wp-json/wp/v2/posts?per_page=30`);
    const list = response.data;
    ctx.state.data = {
        title: `ACG17 - 全部文章`,
        link: `${host}/blog`,
        description: 'ACG17 - 全部文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
};
