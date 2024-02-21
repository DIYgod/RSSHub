//https://www.hicairo.com/feed.php
const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.hicairo.com';
    response = await got('https://www.hicairo.com/feed.php');
    const $ = cheerio.load(response.data, { xmlMode: true });
    let title, description, items;
    title = $('channel > title').text();
    description = $('channel > description').text();
    items = $('channel > item')
        .map((_, item) => {
           const $item = $(item);
           const link = $item.find('link').text();
           const title = $item.find('title').text();
           const description = $item.find('description').text();
           const pubDate = $item.find('pubDate').text();
           return {
               link,
               pubDate,  // no need to normalize because it's from a valid RSS feed
               title,
               description,
           };
        })
        .get();

    ctx.state.data = {
        title,
        description,
        link: currentUrl,
        item: items,
    };
};
