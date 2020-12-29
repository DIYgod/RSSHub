/* eslint-disable no-console */
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const region = ctx.params.region || 'All';
    const sector = ctx.params.sector || 'All';
    const topic = ctx.params.topic || 'All';

    const link = `https://www.povertyactionlab.org/blog?region=${region}&sector=${sector}&topic=${topic}`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.views-row');
    let itemPicUrl;

    ctx.state.data = {
        title: 'The Proverty Action Lab | Blog',
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img.image-style-full-width-medium-cropped').first().attr('src');
                    return {
                        title: item.find('h3.blog-teaser-title').first().text(),
                        author: item.find('div.person-title-title').text(),
                        date: item.find('time.datetime').attr('datetime'),
                        description: `${item.find('div.blog-teaser-summary').text()}<img src="${itemPicUrl}">`,
                        link: item.find('h3.blog-teaser-title').child(0).attr('href'),
                    };
                })
                .get(),
    };
};
