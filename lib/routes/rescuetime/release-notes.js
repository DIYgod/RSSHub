import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        os = 'mac'
    } = ctx.params;

    const rootUrl = 'https://www.rescuetime.com/release-notes';
    const currentUrl = `${rootUrl}/${os}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/<h3 align="left">/g, '</content><content><h3 align="left">'));

    const items = $('.release')
        .map((_, item) => {
            item = $(item);

            const title = item.find('h2').text();
            item.find('h2').remove();

            return {
                title,
                link: currentUrl,
                description: item.html(),
                pubDate: new Date(title.match(/\d{4}\/\d{2}\/\d{2}/)[1]),
            };
        })
        .get();

    ctx.state.data = {
        title: $('h1').text(),
        link: currentUrl,
        item: items,
    };
};
