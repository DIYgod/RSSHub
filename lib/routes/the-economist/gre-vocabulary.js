const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://gre.economist.com/gre-vocabulary';
    const response = await axios({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const word = $('.gre-vocabulary-word').text();
    const time = $('.gre-vocabulary-published').attr('datetime');
    const link =
        'https://gre.economist.com' +
        $('.gre-vocabulary-teaser-view-link')
            .eq(0)
            .attr('href');

    ctx.state.data = {
        title: 'The Economist GRE Vocabulary',
        link: url,
        item: [
            {
                title: `${word} - ${time}`,
                description: $('[itemprop="articleBody"]').html(),
                pubDate: new Date(time).toUTCString(),
                link,
            },
        ],
    };
};
