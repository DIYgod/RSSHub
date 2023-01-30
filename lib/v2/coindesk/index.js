const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.coindesk.com';

const channelMap = {
    'consensus-magazine': 'Consensus Magazine',
};

function convertTime(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    return `${hours === '12' ? '00' : modifier === 'p.m.' ? parseInt(hours, 10) + 12 : hours}:${minutes}`;
}

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'consensus-magazine';

    const response = await got.get(`${rootUrl}/${channel}`);
    const $ = cheerio.load(response.data);
    const list = $('div.article-card')
        .map((_, item) => {
            const title = $(item).find('h4').text();
            const link = rootUrl + $(item).find('a').attr('href');
            const imgURL = $(item).find('img').attr('src');
            const description = `${$(item).find('span.content-text').text()}<br><img src="${imgURL}">`;
            const pubDate = parseRelativeDate($(item).find('div.timing-data span').first().text());
            const arr = pubDate.replace('UTC', '').split(' at');
            return {
                title,
                description,
                link,
                pubDate: Date.parse(`${arr[0]} ${convertTime(arr[1].trim())} UTC`),
            };
        })
        .get();

    ctx.state.data = {
        title: `CoinDesk - ${channelMap[channel]}`,
        link: rootUrl,
        item: list,
    };
};
