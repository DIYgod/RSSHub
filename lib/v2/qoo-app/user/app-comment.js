const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { userUrl, appsUrl } = require('../utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { uid, lang = '' } = ctx.params;
    const link = `${userUrl}${lang ? `/${lang}` : ''}/${uid}`;

    const { data: response } = await got(link);
    const { data } = await got(`${userUrl}/getUserAppCommentList`, {
        searchParams: {
            fid: uid,
        },
    });

    const $ = cheerio.load(response);
    const username = $('.person .name').text();

    const items = data.list.map((item) => ({
        title: `${username} ▶ ${item.app.name}`,
        link: `${appsUrl}/comment-detail/${item.comment.id}`,
        description: art(path.join(__dirname, '../templates/comment.art'), {
            rating: item.score,
            text: item.comment.content,
        }),
        pubDate: timezone(parseDate(item.comment.created_at, 'YYYY-MM-DD'), 8),
        author: username,
    }));

    ctx.state.data = {
        title: $('head title').text(),
        link,
        image: decodeURIComponent($('.person div.slot').attr('data-args')).replace('avatar=', '').split('?')[0],
        language: $('html').attr('lang'),
        item: items,
    };
};
