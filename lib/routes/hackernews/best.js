const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://news.ycombinator.com/best';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const items = $('a.storylink')
        .map(function() {
            return {
                title: $(this).text(),
                link: $(this).attr('href'),
            };
        })
        .get();

    $('a.hnuser').each(function(i) {
        items[i].author = $(this).text();
    });

    ctx.state.data = {
        title: 'Hacker News Top Links',
        link: url,
        item: items,
    };
};
