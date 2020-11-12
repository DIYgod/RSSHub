const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const os = ctx.params.os || 'ios';
    const lang = ctx.params.lang || 'zh-cn';

    const link = `https://www.konami.com/wepes/mobile/${lang}/information?os=${os}&page=1&num=20`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const items = $('ul.topics_list li')
        .get()
        .slice(1, 11)
        .map((m) => {
            const title = `[${$(m).find('span:nth-of-type(2)').text()}] ${$(m).find('span.topics_title').text()}`;
            return {
                title,
                link,
                description: $(m).find('div.topics_text').html(),
                pubDate: new Date($(m).find('span.topics_date').text()),
                guid: `PES Mobile ${title} ${$(m).find('span.topics_date').text()}`,
            };
        });

    ctx.state.data = {
        title: `PES Mobile ${$('h1').text()}`,
        link,
        item: items,
    };
};
