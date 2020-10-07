const got = require('@/utils/got');
const cheerio = require('cheerio');

const dateStringRegex = /(\d{4})-(\d{2})-(\d{2})/;

module.exports = async (ctx) => {
    const { name, id } = ctx.params;

    const title = `${name}のイベント・ライブ情報一覧`;
    const link = `https://www.eventernote.com/actors/${name}/${id}/events`;

    let page = 1;
    const events = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const pageLink = link + `?limit=100&page=${page}`;
        // eslint-disable-next-line no-await-in-loop
        const response = await got({
            method: 'get',
            url: pageLink,
        });

        const data = response.data;

        const $ = cheerio.load(data);
        const list = $('li.clearfix');

        if (list.length === 0) {
            break;
        }

        for (let i = 0; i < list.length; ++i) {
            const event = list[i];

            // extract event title
            const title = $('div.event > h4 > a', event).text();

            // extract event location
            const location = $('div.event > div.place > a', event).text();

            // extract event date
            const dateMatches = $('div.date > p', event).text().match(dateStringRegex);
            const year = parseInt(dateMatches[1]);
            const month = parseInt(dateMatches[2]);
            const day = parseInt(dateMatches[3]);
            const time = new Date(year, month, day);

            // extract event link
            const link = $('div.event > h4 > a', event).attr('href');

            events.push({
                title,
                description: location,
                pubDate: time.toLocaleString('ja'),
                link,
            });
        }

        page += 1;
    }

    ctx.state.data = {
        title,
        link,
        description: title,
        language: 'ja',
        allowEmpty: true,
        item: events,
    };
};
