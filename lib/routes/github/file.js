const got = require('@/utils/got');
const config = require('@/config').value;
const queryString = require('query-string');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo;
    const branch = ctx.params.branch;
    const filepath = ctx.params.filepath;

    const fileUrl = `https://github.com/${user}/${repo}/commits/${branch}/${filepath}`;

    const headers = {};
    if (config.github && config.github.access_token) {
        headers.Authorization = `token ${config.github.access_token}`;
    }
    const res = await got.get(`https://api.github.com/repos/${user}/${repo}/commits`, {
        searchParams: queryString.stringify({
            sha: branch,
            path: filepath,
        }),
        headers,
    });
    const list = res.data;
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItems = count.map((i) => {
        const each = list[i];
        return {
            title: each.commit.message.split('\n')[0],
            description: `<pre>${each.commit.message}</pre>`,
            link: each.html_url,
            author: each.commit.author.name,
            pubDate: new Date(each.commit.committer.date).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `GitHub File - ${user}/${repo}/${branch}/${filepath}`,
        link: fileUrl,
        item: resultItems,
    };
};
