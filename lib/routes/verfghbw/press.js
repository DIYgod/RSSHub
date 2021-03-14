const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    let request = {
        url: 'https://verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/',
        headers: {
            Referer: 'https://verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/',
        },
    };

    if (keyword) {
        request = {
            method: 'post',
            form: {
                'tx_bwlistheader_list[search][keywords]': keyword,
            },
            ...request,
        };
    } else {
        request = {
            method: 'get',
            ...request,
        };
    }

    const response = await got(request);

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('.pressListItem')
        .map((_, item) => {
            item = $(item);

            const title = item.find('.pressListItemTeaser > h3').text().trim();
            const link = new URL(item.find('.link-download').attr('href'), 'https://verfgh.baden-wuerttemberg.de/').toString();

            return {
                title,
                link,
                description: `<a href="${link}" target="_blank">${title}</a>`,
                pubDate: dayjs(item.find('.pressListItemDate > span').text(), 'DD.MM.YYYY').toDate().toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Verfassungsgerichtshof Baden-Württemberg - Pressemitteilungen',
        link: request.url,
        description: 'Pressemitteilungen des Verfassungsgerichtshof für das Land Baden-Württemberg',
        item: list,
    };
};
