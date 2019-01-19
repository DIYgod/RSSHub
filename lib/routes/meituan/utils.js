const cheerio = require('cheerio');

const ProcessTechFeed = async (list) => {
    const titleClass = '.post-title';
    const dateClass = '.m-post-date';
    const dateRex = /\d{4}年\d{2}月\d{2}/;
    const timeZone = 8;
    const descriptionClass = '.post-content';
    const nickClass = '.m-post-nick';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $(titleClass)
                .find('a')
                .first();
            const itemTitle = $title.text();
            const itemUrl = $title.attr('href');

            const authorNicks = $(nickClass).text();

            const date = new Date(
                $(dateClass)
                    .text()
                    .match(dateRex)
            );
            const serverOffset = date.getTimezoneOffset() / 60;
            const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

            const description = $(descriptionClass).text();

            const single = {
                title: itemTitle,
                link: itemUrl,
                author: authorNicks,
                description: description,
                pubDate: pubDate,
                guid: itemUrl,
            };
            return single;
        })
    );
};

module.exports = {
    ProcessTechFeed,
};
