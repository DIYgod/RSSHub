import got from '~/utils/got.js';
import cheerio from 'cheerio';
import { parseDate } from '~/utils/parse-date.js'

export default async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.europapress.es';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.articulo-titulo, .c-item__title, .home-articulo-titulo')
        .find('a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.full644').html() + content('.NormalTextoNoticia').html();
                item.pubDate = parseDate(content('meta[name="date"]').attr('content').replace(' ', ''));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
