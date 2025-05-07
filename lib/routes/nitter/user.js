const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const nitterInstance = 'https://nitter.poast.org';
    const url = `${nitterInstance}/${id}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.timeline-item')
        .map((_, el) => {
            const tweet = $(el);
            const content = tweet.find('.tweet-content').text().trim();
            const link = nitterInstance + tweet.find('a.tweet-link').attr('href');
            const pubDate = tweet.find('.tweet-date a').attr('title') || '';
            return {
                title: content.slice(0, 100),
                description: content,
                link,
                pubDate: parseDate(pubDate),
            };
        })
        .get();

    ctx.state.data = {
        title: `Nitter / ${id}`,
        link: url,
        item: items,
    };
};
