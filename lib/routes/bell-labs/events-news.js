const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    events: '.tout-text a',
    'industry-recognition': '.n-block-section .n-block .rich-text p b',
    'press-releases': 'h5 a',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'press-releases';

    const rootUrl = 'http://www.bell-labs.com';
    const currentUrl = `${rootUrl}/events-news/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = (category === 'industry-recognition' ? $(config[category]).closest('.rich-text') : $(config[category]))
        .slice(0, 15)
        .map((_, i) => {
            let item = $(i);

            if (category === 'industry-recognition') {
                item = item.children('.n-link-list').length > 0 ? item.children('.n-link-list') : item.children('p').eq(1);
            }
            if (item.children('a').attr('href')) {
                item = item.children('a');
            }

            return {
                title: item.text(),
                link: item.attr('href') || currentUrl,
                pubDate: new Date(category === 'events' ? item.text().split(':')[0].split(' - ')[0] : category === 'industry-recognition' ? $(i).children('p').eq(0).text() : '').toUTCString(),

                description: category === 'events' ? item.closest('.n-block').next().find('.rich-text').html() : category === 'industry-recognition' ? `<p>${$(i).find('p').last().text()}</p>` : '',
            };
        })
        .get();

    if (category === 'press-releases') {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.social-media-sharing').remove();

                    item.description = content('.layout-content').html();
                    item.pubDate = new Date(content('meta[name="search-updated"]').attr('content')).toUTCString();

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: $('title').eq(0).text(),
        link: currentUrl,
        item: items,
    };
};
