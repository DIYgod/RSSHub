const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')();

module.exports = async (ctx) => {
    const response = await got('https://api.github.com/repos/Dreamacro/clash/releases/tags/premium');
    const data = response.data;

    ctx.state.data = {
        title: 'Clash Premium Releases',
        link: 'https://github.com/Dreamacro/clash/releases/tag/premium',
        description: 'Clash Premium Releases',
        item: [
            {
                title: data.name,
                author: data.author.login,
                description: md.render(data.body),
                pubDate: parseDate(data.assets[0].updated_at),
                link: `https://github.com/Dreamacro/clash/releases/tag/premium#${encodeURIComponent(data.name)}`,
            },
        ],
    };
};
