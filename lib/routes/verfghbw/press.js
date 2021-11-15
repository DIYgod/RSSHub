import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        keyword
    } = ctx.params;

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

    const {
        data
    } = await got(request);
    const $ = cheerio.load(data);

    const list = $('.pressListItem')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('.pressListItemTeaser > h3').text().trim(),
                link: new URL(item.find('.link-download').attr('href'), 'https://verfgh.baden-wuerttemberg.de/'),
                pubDate: new Date(item.find('.pressListItemDate > span').text()).toUTCString(),
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
