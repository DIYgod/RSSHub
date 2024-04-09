const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { ssoUrl, notesUrl } = require('../utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const api = `${ssoUrl}/api/v1/comments`;
    const link = `${notesUrl}/note/${id}`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const { data } = await got(api, {
        searchParams: {
            sort: 'newest',
            for: 'web',
            limit: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
            type: 'note',
            object_id: id,
        },
    });

    const items = data.data.map((item) => ({
        title: item.content,
        description: art(path.join(__dirname, '../templates/note.art'), {
            content: item.content,
            picture: item.picture,
        }),
        pubDate: parseDate(item.created_timestamp),
        author: item.user.name,
        guid: `qoo-app:notes:note:${id}:${item.id}`,
    }));

    ctx.state.data = {
        title: $('head title').text(),
        link,
        language: $('html').attr('lang'),
        item: items,
    };
};
