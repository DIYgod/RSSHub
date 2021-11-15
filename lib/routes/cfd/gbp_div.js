import got from '~/utils/got.js';
import cheerio from 'cheerio';
import dateParser from '~/utils/dateParser.js';

export default async (ctx) => {
    const link = 'https://www.cmcmarkets.com/en-gb/news-and-analysis/upcoming-indices-dividend-drop-points';
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const title = $($('.news-table-wrapper')[0]).prev().text().replace('*', '');

    const pubDate = dateParser($('meta[itemprop="datePublished"]').attr('content'), 'YYYY-MM-DD-HH:mm');

    ctx.state.data = {
        title: 'Upcoming CFD indices dividend adjustments',
        link,
        item: [
            {
                title,
                description: $('.news-table-wrapper').html(),
                pubDate,
                link,
                guid: title + pubDate,
            },
        ],
    };
};
