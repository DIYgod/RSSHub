const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const sort = ctx.params.sort || 'hot';

    let baseURL = 'https://gab.com/api/v1/timelines/explore?page=1&sort_by=';
    baseURL += sort === 'hot' ? 'hot' : 'top_today';

    const response = await got.get(baseURL);

    const result = await Promise.all(
        response.data.map((item) => {
            const media = item.media_attachments.map((item) => `<img src='${item.url}'>`).join('<br>');
            const $ = cheerio.load(item.content);

            return {
                title: $.text() || 'Untitled',
                description: item.content + (media && '<br>' + media),
                link: item.url || baseURL,
                pubDate: new Date(item.created_at).toISOString(),
            };
        })
    );

    ctx.state.data = {
        title: `Gab - Popular posts`,
        link: baseURL,
        item: result,
    };
};
