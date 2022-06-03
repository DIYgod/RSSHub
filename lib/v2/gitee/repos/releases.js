const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const { owner, repo } = ctx.params;

    const response = await got(`https://gitee.com/api/v5/repos/${owner}/${repo}/releases`, {
        searchParams: {
            access_token: config.gitee.access_token ? config.gitee.access_token : undefined,
            per_page: ctx.query.limit ? Number(ctx.query.limit) : 100,
            direction: 'desc',
        },
    });

    const items = response.data.map((item) => ({
        title: item.tag_name,
        description: md.render(item.body),
        author: item.author.login,
        pubDate: parseDate(item.created_at),
        guid: item.target_commitish,
        link: `https://gitee.com/${owner}/${repo}/releases/${item.tag_name}`,
    }));

    ctx.state.data = {
        title: `${owner}/${repo} - 发行版`,
        link: `https://gitee.com/${owner}/${repo}/releases`,
        item: items,
    };
};
