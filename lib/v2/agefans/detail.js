const got = require('@/utils/got');
const cheerio = require('cheerio');
const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const response = await got(`${rootUrl}/detail/${ctx.params.id}`);
    const $ = cheerio.load(response.data);

    const ldJson = JSON.parse($('script[type="application/ld+json"]').text());

    const items = $('.video_detail_episode')
        .first()
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href').replace('http://', 'https://'),
            };
        })
        .reverse();

    ctx.state.data = {
        title: `AGE动漫 - ${ldJson.name}`,
        link: `${rootUrl}/detail/${ctx.params.id}`,
        description: ldJson.description,
        item: items,
    };
};
