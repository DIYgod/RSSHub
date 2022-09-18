const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const { data } = await got(`https://www.v2ex.com/api/topics/${type}.json`);

    let title;
    if (type === 'hot') {
        title = '最热主题';
    } else if (type === 'latest') {
        title = '最新主题';
    }

    ctx.state.data = {
        title: `V2EX-${title}`,
        link: 'https://www.v2ex.com/',
        description: `V2EX-${title}`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.member.username}: ${item.content_rendered}`,
            content: { text: item.content, html: item.content_rendered },
            pubDate: parseDate(item.created, 'X'),
            link: item.url,
            author: item.member.username,
            comments: item.replies,
        })),
    };
};
