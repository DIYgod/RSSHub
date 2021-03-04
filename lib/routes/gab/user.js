const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const response = await got.get('https://gab.com/api/v1/account_by_username/' + username);
    const id = response.data.id;
    const gabs = await got.get(`https://gab.com/api/v1/accounts/${id}/statuses?exclude_replies=true`);

    const result = await Promise.all(
        gabs.data
            .filter((item) => !item.reblog)
            .map((item) => {
                const media = item.media_attachments.map((item) => `<img src='${item.url}'>`).join('<br>');
                const $ = cheerio.load(item.content);

                return {
                    title: $.text() || 'Untitled',
                    description: item.content + (media && '<br>' + media),
                    link: item.url || `https://gab.com/${username}`,
                    pubDate: new Date(item.created_at).toISOString(),
                };
            })
    );

    ctx.state.data = {
        title: `Gab - ${username}`,
        link: `https://gab.com/${username}`,
        item: result,
    };
};
