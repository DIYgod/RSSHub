const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const { owner, repo } = ctx.params;

    const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/events`;
    const response = await ctx.cache.tryGet(
        apiUrl,
        async () =>
            (
                await got(apiUrl, {
                    searchParams: {
                        access_token: config.gitee.access_token ? config.gitee.access_token : undefined,
                        limit: ctx.query.limit ? Number(ctx.query.limit) : 100,
                    },
                })
            ).data
    );

    let items = response.map((item) => ({
        title: item.type,
        author: item.actor.login,
        pubDate: parseDate(item.created_at),
        guid: item.id,
        type: item.type,
        payload: item.payload,
    }));

    items = items.map((item) => {
        switch (item.type) {
            case 'IssueEvent':
                item.title = item.payload.title;
                item.description = md.render(item.payload.body);
                item.link = item.payload.html_url;
                break;
            case 'ForkEvent':
                item.title = `${item.author || item.actor.login} forked ${owner}/${repo}`;
                item.link = item.payload.html_url;
                break;
            case 'StarEvent':
                item.title = `${item.author || item.actor.login} ${item.payload.action} ${owner}/${repo}`;
                break;
            case 'IssueCommentEvent':
                item.title = item.payload.issue.title;
                item.description = md.render(item.payload.comment.body);
                item.link = item.payload.comment.html_url;
                break;
            default:
                break;
        }
        delete item.type;
        delete item.payload;
        return item;
    });

    ctx.state.data = {
        title: `${owner}/${repo} - 仓库动态`,
        link: `https://gitee.com/${owner}/${repo}`,
        item: items,
    };
};
