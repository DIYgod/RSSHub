const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || '315';

    let rootUrl;

    if (ctx.params.id === '315') {
        rootUrl = `https://315.cctv.com`;
    } else {
        rootUrl = `https://news.cctv.com/special/${ctx.params.id}/index.shtml`;
    }

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('h3>a, h4>a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    let date;

                    if (item.link.indexOf('photo.cctv.com') > 0) {
                        const imageLink = item.link.split('.shtml')[0] + '.xml?randomNum=26';
                        const imageResponse = await got({
                            method: 'get',
                            url: imageLink,
                        });
                        const images = cheerio.load(imageResponse.data);

                        let description;

                        item.description = '';

                        images('li')
                            .get()
                            .forEach((i) => {
                                i = images(i);
                                item.description += `<img src="${i.attr('photourl')}">`;
                                date = i.attr('time').replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '');
                                description = i.html();
                            });

                        item.description += `<p>${description}</p>`;
                    } else {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = cheerio.load(detailResponse.data);
                        const match = detailResponse.data.match(/publishDate ="(.*)";/);

                        if (match === null) {
                            let dateSpan;

                            if (content('div.info span').html() !== null) {
                                dateSpan = content('div.info span').text();
                            } else if (content('div.info1').html() !== null) {
                                dateSpan = content('div.info1').text().split(' | ')[1];
                            } else {
                                dateSpan = content('span.time').text();
                            }

                            date = dateSpan.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '');
                        } else {
                            const dateString = match[1];
                            date = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)} ${dateString.slice(8, 10)}:${dateString.slice(10, 12)}:${dateString.slice(12, 14)}`;
                        }

                        if (content('#content_area').html() !== null) {
                            item.description = content('#content_area').html();
                        } else if (content('div.cnt_bd').html() !== null) {
                            content('div.function,h1,h2').remove();
                            item.description = content('div.cnt_bd').html();
                        } else if (content('#text_area').html() !== null) {
                            item.description = content('#text_area').html();
                        } else {
                            item.description = content('div.con').html();
                        }
                    }

                    item.pubDate = new Date(date + ' GMT+8').toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('title').text().split('_')[0]} - 新闻专题 -  央视网`,
        link: rootUrl,
        item: items,
    };
};
