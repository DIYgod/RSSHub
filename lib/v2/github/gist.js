const got = require('@/utils/got');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { gistId } = ctx.params;

    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (config.github && config.github.access_token) {
        headers.Authorization = `Bearer ${config.github.access_token}`;
    }

    const host = 'https://gist.github.com';
    const apiUrl = `https://api.github.com/gists/${gistId}`;

    const { data: response } = await got(apiUrl, {
        headers,
    });

    const items = response.history.map((item, index) => ({
        title: `${item.user.login} ${index === response.history.length - 1 ? 'created' : 'revised'} this gist`,
        description: item.change_status.total ? `${item.change_status.additions} additions and ${item.change_status.deletions} deletions` : null,
        link: `${host}/${gistId}/${item.version}`,
        pubDate: parseDate(item.committed_at), // e.g. 2022-09-02T11:09:56Z
    }));

    ctx.state.data = {
        allowEmpty: true,
        title: `${response.owner.login} / ${Object.values(response.files)[0].filename}`,
        description: response.description,
        image: response.owner.avatar_url,
        link: `${response.html_url}/revisions`,
        item: items,
    };
};
