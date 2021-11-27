const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const since = ctx.params.since;
    const language = ctx.params.language || '';
    const url = `https://github.com/trending/${encodeURIComponent(language)}?since=${since}`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article');

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('h1').text(),
                        author: item.find('h1').text().split('/')[0].trim(),
                        description: `${item.find('.pr-4').text()}<br>
                            <br>Language: ${item.find('span[itemprop="programmingLanguage"]').text() || 'unknown'}
                            <br>Star: ${item.find('.Link--muted').eq(0).text().trim()}
                            <br>Fork: ${item.find('.Link--muted').eq(1).text().trim()}`,
                        link: `https://github.com${item.find('h1 a').attr('href')}`,
                    };
                })
                .get(),
    };
};
