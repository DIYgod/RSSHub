const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://gogoanimehd.io';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const recentReleases = $('.last_episodes');
    const listItems = $(recentReleases).find('li');
    const arrayOfItems = [];

    for (const listItem of listItems) {
        const title = $(listItem).find('.name a').attr('title');
        const episode = $(listItem).find('.episode').text();
        const link = $(listItem).find('.name a').attr('href');
        const img = $(listItem).find('.img a img').attr('src');

        const formattedTitle = `<div>${title}<br/><h2>${episode}</h2></div>`;
        const formattedDescription = `<img src='${img}' alt='${title}'>`;

        const structuredData = {
            title: formattedTitle,
            description: formattedDescription,
            link,
        };
        arrayOfItems.push(structuredData);
    }

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: arrayOfItems,
    };
};