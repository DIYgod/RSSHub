const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const { owner, repo } = ctx.params;

    const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/commits`;
    const response = await ctx.cache.tryGet(
        apiUrl,
        async () =>
            (
                await got(apiUrl, {
                    searchParams: {
                        access_token: config.gitee.access_token ? config.gitee.access_token : undefined,
                        per_page: ctx.query.limit ? Number(ctx.query.limit) : 100,
                        direction: 'desc',
                    },
                })
            ).data
    );

    const items = response.map((item) => ({
        title: md.renderInline(item.commit.message),
        description: md.render(item.commit.message),
        author: item.author?.login || item.commit.author.name,
        pubDate: parseDate(item.commit.author.date),
        guid: item.sha,
        link: item.html_url,
    }));

    ctx.state.data = {
        title: `${owner}/${repo} - 提交`,
        link: `https://gitee.com/${owner}/${repo}/commits`,
        item: items,
    };
};
