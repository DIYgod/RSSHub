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
    const currentUrl = `${rootUrl}/radio/${id}/audio`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const image = $('meta[property="og:image"]').attr('content');

    let items = $('.audio_list section')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h3').text(),
                link: new URL(item.find('a').attr('href'), rootUrl).href,
                pubDate: timezone(parseDate(item.find('.update_date').text(), 'YYYY年MM月DD日'), +9),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                const audio = `https:${content('audio').attr('src').split('?')[0]}`;

                item.enclosure_url = audio;
                item.enclosure_type = 'audio/mpeg';
                item.itunes_item_image = image;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: content('.audio_intro').text(),
                    audio,
                });

                return item;
            })
        )
    );

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
