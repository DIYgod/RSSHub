const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    let baseURL;
    switch (ctx.params.language) {
        case 'cantonese':
            baseURL = 'https://www.voacantonese.com/';
            break;
        case 'chinese':
            baseURL = 'https://www.voachinese.com/';
            break;
        case 'tibetan':
            baseURL = 'https://www.voatibetan.com/';
            break;
        default:
            throw Error('The language specified does not exist');
    }

    const response = await got.get(baseURL + 'api/' + (ctx.params.channel || ''));
    const $ = cheerio.load(response.data);

    const list = [];
    $('item').each((_, e) => {
        const item = {};
        item.title = $(e).find('title').first().text();
        item.link = $(e).find('guid').first().text();
        item.pubDate = $(e).find('pubDate').first().text();
        item.description = $(e).find('description').first().text();
        list.push(item);
    });

    const result = await Promise.all(
        list
            .filter((item) => item.link)
            .map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const content = await got.get(item.link);
                    const description = cheerio.load(content.data);
                    description('.wsw__embed').remove();

                    item.description = description('div#article-content div').first().html() ? description('div.cover-media') + description('div#article-content div').first().html() : item.description;

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: $('channel title').first().text(),
        link: baseURL,
        item: result,
    };
};
