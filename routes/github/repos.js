const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const token = 'ac97f3af103c6e26ed8d8ac1606af5f46398fee4';
    const user = ctx.params.user;
    const uri = `https://api.github.com/users/${user}/repos` + `?access_token=${token}`;

    const response = await axios({
        method: 'get',
        url: uri,
        headers: {
            'User-Agent': config.ua,
            Referer: uri,
        },
    });
    const data = response.data;
    ctx.state.data = {
        title: `GitHub Repos By ${user}`,
        link: uri,
        description: `GitHub Repos By ${user}`,
        item:
            data &&
            data.map((item) => {
                let repoDescription = item.description;
                if (repoDescription === null) {
                    repoDescription = 'No description added';
                }
                return {
                    title: `${item.name}`,
                    guid: `${item.id}`,
                    description: `${repoDescription}`,
                    link: `${item.url}`,
                };
            }),
    };
};
