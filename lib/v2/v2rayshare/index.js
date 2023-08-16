const got = require('@/utils/got'); // 自订的 got
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data: response } = await got('https://v2rayshare.com/wp-json/wp/v2/posts/?per_page=10');

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        author: 'V2rayShare',
        category: ['免费节点'],
        pubDate: parseDate(item.date_gmt),
        description: item.content.rendered,
    }));

    ctx.state.data = {
        title: 'V2rayShare',
        link: 'https://v2rayshare.com/',
        description: '免费节点分享网站',
        item: items,
    };
};
