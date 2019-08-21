const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const response = await got(`http://jskou.com:3003/contents/list?type=${type || 0}&page=0&pageSize=30`);
    const item = response.data.data.map((item) => {
        const tag = item.tag ? `[${item.tag}]` : '';
        return {
            title: item.title,
            description: `${tag} ${item.title}`,
            pubDate: item.time,
            link: item.link,
        };
    });
    ctx.state.data = {
        title: type === '0' ? '前端艺术家每日资讯整理' : '飞冰早报整理',
        link: 'http://fe.jskou.com/',
        description: '前端艺术家1群每日资讯,飞冰早报',
        item,
    };
};
