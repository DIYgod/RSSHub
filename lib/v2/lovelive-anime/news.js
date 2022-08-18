const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

module.exports = async (ctx) => {
    const rootUrl = 'https://www.lovelive-anime.jp/news/';

    const response = await got(rootUrl);

    const $ = cheerio.load(response.data);

    const pageFace = $('div.c-card.p-colum__box')
        .map((_, item) => {
            item = $(item);

            return {
                link: item.find('a.c-card__head').attr('href'),
                pubDate: item.find('span.c-card__date').text(),
                title: item.find('div.c-card__title').text(),
                // description: `${item.find('div.c-card__title').text()}<br><img src="${item.find('a.c-card__head > div > figure > img').attr('src')}">`
                description: renderDescription({
                    title: item.find('div.c-card__title').text(),
                    imglink: item.find('a.c-card__head > div > figure > img').attr('src'),
                }),
            };
        })
        .get();

    let items = pageFace;

    if (ctx.params.option === 'detail') {
        items = await Promise.all(
            pageFace.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResp = await got(item.link);
                    const $ = cheerio.load(detailResp.data);

                    const content = $('div.p-page__detail.p-article');
                    for (const v of content.find('img')) {
                        v.attribs.src = 'https://www.lovelive-anime.jp' + v.attribs.src;
                    }
                    item.description = content.html();
                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: 'lovelive official website news',
        link: 'https://www.lovelive-anime.jp/news/',
        item: items,
    };
};
