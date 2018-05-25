const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const uri = `https://api.github.com/users/${user}/repos`;

    const response = await axios({
        method: 'get',
        url: uri,
        headers: {
            'User-Agent': config.ua,
            Referer: uri,
        },
    });
    const data = response.data;
    // define variables
    let repoTitle = '';
    let repoId = '';
    let repoDescription = '';
    let repoStargazersCount = '';
    let repoForksCount = '';
    let repoWatchersCount = '';
    let repoUrl = '';

    ctx.state.data = {
        title: `GitHub Repos By ${user}`,
        link: uri,
        description: `GitHub Repos By ${user}`,
        item:
            data &&
            data.map((item) => {
                repoTitle = item.name;
                repoId = item.id;
                repoDescription = item.description;
                repoStargazersCount = item.stargazers_count;
                repoForksCount = item.forks_count;
                repoWatchersCount = item.watchers_count;
                repoUrl = item.url;
                if (repoDescription === null) {
                    repoDescription = 'No description added';
                }
                return {
                    title: `${repoTitle}`,
                    guid: `${repoId}`,
                    description: `${repoDescription}` + ` [star: ${repoStargazersCount}` + ` fork: ${repoForksCount}` + ` watch: ${repoWatchersCount}]`,
                    link: `${repoUrl}`,
                };
            }),
    };
};
