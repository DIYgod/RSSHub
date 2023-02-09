const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { username, repo } = ctx.params;
    const response = await got(`https://issuehunt.io/apis/pages/repos/show?repositoryOwnerName=${username}&repositoryName=${repo}`);

    const { issues } = response.data;
    if (issues === undefined) {
        throw new Error('没有获取到数据');
    }

    ctx.state.data = {
        title: `Issue Hunt 的悬赏 -- ${username}/${repo}`,
        link: `https://issuehunt.io/r/${username}/${repo}`,
        description: ``,
        item: issues.map((item) => ({
            title: item.title,
            description: item.body,
            pubDate: item.fundedAt,
            link: `https://issuehunt.io/r/${username}/${repo}/issues/${item.number}`,
            author: item.userName,
        })),
    };
};
