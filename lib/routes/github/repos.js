const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const response = await got({
        method: 'get',
        url: `https://api.github.com/users/${user}/repos`,
        params: {
            sort: 'created',
            access_token: config.github && config.github.access_token,
        },
    });
    const data = response.data;
    ctx.state.data = {
        title: `${user}'s GitHub repositories`,
        link: `https://github.com/${user}`,
        item:
            data &&
            data.map((item) => ({
                title: item.name,
                description: item.description || 'No description',
                pubDate: new Date(item.created_at).toUTCString(),
                link: item.html_url,
            })),
    };
};
