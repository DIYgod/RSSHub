const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'maitta';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 150;

    const rootUrl = 'https://www.ibc.co.jp';
    const currentUrl = `${rootUrl}/radio/${id}/audio/`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);

    const image = $('meta[property="og:image"]').attr('content');

    let radioId = $('link[title="RSS"]').attr('href')?.split('/rss/').pop().replace(/\/$/, '') ?? '';

    let items = $('.audio_list section').toArray();

    if (!radioId) {
        const item = $(items[0]);

        response = await got({
            method: 'get',
            url: new URL(item.find('a').attr('href'), rootUrl).href,
        });

        $ = cheerio.load(response.data);

        radioId = $('audio')
            .attr('src')
            .match(/\/sound\/(\d+)_/)[1];
    }

    items = items.slice(0, limit).map((item) => {
        item = $(item);

        const link = new URL(item.find('a').attr('href'), rootUrl).href;
        const audioId = link.match(/\/aitem\/(\d+)/)[1];
        const audio = `https://media-data.cdn.ibc.co.jp/out/sound/${radioId}_${audioId}/${radioId}_${audioId}.mp3`;

        return {
            link,
            title: item.find('h3').text(),
            pubDate: timezone(parseDate(item.find('.update_date').text(), 'YYYY年MM月DD日'), +9),
            enclosure_url: audio,
            enclosure_type: 'audio/mpeg',
            itunes_item_image: image,
            description: art(path.join(__dirname, 'templates/description.art'), {
                description: item.find('.audio_intro').text(),
                audio,
            }),
        };
    });

    ctx.state.data = {
        title: $('title').text() || `IBC岩手放送｜${$('.programinfo h3').text()}`,
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
        itunes_author: 'IBC岩手放送',
        image,
        allowEmpty: true,
    };
};
