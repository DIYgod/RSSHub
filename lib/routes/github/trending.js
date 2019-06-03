const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const since = ctx.params.since;
    const language = ctx.params.language || '';
    const url = `https://github.com/trending/${language}?since=${since}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.repo-list li');

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('h3').text(),
                        description: `${item.find('.py-1').text()}<br>
                            <br>Language: ${item.find('span[itemprop="programmingLanguage"]').text() || 'unknown'}
                            <br>Star: ${item
                                .find('.muted-link')
                                .eq(0)
                                .text()}
                            <br>Fork: ${item
                                .find('.muted-link')
                                .eq(1)
                                .text()}`,
                        link: `https://github.com${item.find('h3 a').attr('href')}`,
                    };
                })
                .get(),
    };
};
