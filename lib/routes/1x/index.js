const got = require('@/utils/got');
const cheerio = require('cheerio');

const categories = {
    latest: 'latest',
    popular: 'popular',
    published: 'published',
    abstract: 'latest:15:',
    action: 'latest:1:',
    animals: 'latest:21:',
    architecture: 'latest:11:',
    conceptual: 'latest:17:',
    'creative-edit': 'latest:10:',
    documentary: 'latest:8:',
    everyday: 'latest:14:',
    'fine-art-nude': 'latest:12:',
    humour: 'latest:3:',
    landscape: 'latest:6:',
    macro: 'latest:2:',
    mood: 'latest:4:',
    night: 'latest:9:',
    performance: 'latest:19:',
    portrait: 'latest:13:',
    'still-life': 'latest:18:',
    street: 'latest:7:',
    underwater: 'latest:20:',
    wildlife: 'latest:5:',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'latest';

    const rootUrl = `https://1x.com`;
    const currentUrl = `${rootUrl}/gallery/${category}`;
    const apiUrl = `${rootUrl}/backend/lm.php?style=normal&mode=${categories[category]}&from=0&autoload=`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('root data')
        .html()
        .split('\n')
        .slice(0, -1)
        .map((item) => {
            item = $(item);

            const id = item
                .find('.photos-feed-image')
                .attr('id')
                .match(/img-(\d+)/)[1];

            return {
                guid: id,
                link: `${rootUrl}/photo/${id}`,
                author: item.find('.photos-feed-data-name').eq(0).text(),
                title: item.find('.photos-feed-data-title').text() || 'Untitled',
                description: `<img src="${item.find('.photos-feed-image').attr('src')}">`,
            };
        });

    ctx.state.data = {
        title: `${category} - 1X`,
        link: currentUrl,
        item: items,
    };
};
