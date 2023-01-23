const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.usenix.org';
const { parseDate } = require('@/utils/parse-date');

const seasons = ['spring', 'summer', 'fall', 'winter'];

module.exports = async (ctx) => {
    const last = new Date().getFullYear() + 1;
    const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`)
        .map((url) => seasons.map((season) => `${url}/${season}-accepted-papers`))
        .flat();
    const responses = await got.all(
        urlList.map(async (url) => {
            let res;
            try {
                res = await got(url);
            } catch (e) {
                // ignore 404
            }
            return res;
        })
    );

    const list = responses
        .filter((element) => element)
        .map((response) => {
            const $ = cheerio.load(response.data);
            const pubDate = parseDate($('meta[property=article:modified_time]').attr('content'));
            return $('article.node-paper')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: item.find('h2.node-title > a').text().trim(),
                        link: `${url}${item.find('h2.node-title > a').attr('href')}`,
                        author: item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text().trim(),
                        pubDate,
                    };
                });
        })
        .flat();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                item.description = $('.content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'USENIX',
        link: url,
        description: 'USENIX Security Symposium Accpeted Papers',
        allowEmpty: true,
        item: items,
    };
};
