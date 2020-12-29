/* eslint-disable no-console */
const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const region = ctx.params.region || 'All';
    const year = ctx.params.year;
    const type = ctx.params.type || 'All';

    let link;
    if (!year) {
        link = `https://www.povertyactionlab.org/blog?region=${region}&news_type=${type}`;
    } else {
        link = `https://www.povertyactionlab.org/blog?region=${region}&year=${year}&news_type=${type}`;
    }

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.views-row');
    let itemPicUrl;

    ctx.state.data = {
        title: 'The Proverty Action Lab | News',
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = url.resolve(link, item.find('img').first().attr('src'));
                    return {
                        title: item.find('h3.in-the-news-teaser-title').first().text(),
                        author: item.find('div.in-the-news-teaser-source').text(),
                        date: item.find('time.datetime').attr('datetime'),
                        description: `${item.find('div.in-the-news-teaser-summary').text()}<img src="${itemPicUrl}">`,
                        link: item.find('h3.in-the-news-teaser-title').child(0).attr('href'),
                    };
                })
                .get(),
    };
};
