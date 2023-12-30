const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { isValidHost } = require('@/utils/valid-host');

const shortcuts = {
    potd: 'picture/browse/potd/',
    potw: 'picture/browse/potw/',
    potm: 'picture/browse/potm/',
};

module.exports = async (ctx) => {
    const language = ctx.params.language ?? '';
    const category = ctx.params.category ?? 'figure';
    if (language && !isValidHost(language)) {
        throw Error('Invalid language');
    }

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/${shortcuts.hasOwnProperty(category) ? shortcuts[category] : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.item-icon, .picture-icon')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            const link = item.attr('href');

            return {
                link: /^http/.test(link) ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.title = content('.headline').text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        pictures: /myfigurecollection\.net\/picture\//.test(item.link)
                            ? [{ src: content('meta[property="og:image"]').attr('content') }]
                            : JSON.parse(decodeURIComponent(content('meta[name="pictures"]').attr('content'))),
                        fields: content('.form-field')
                            .toArray()
                            .map((f) => ({
                                key: content(f).find('.form-label').text(),
                                value: content(f).find('.form-input').text(),
                            })),
                    });
                } catch (e) {
                    item.title = `Item #${item.link.split('/').pop()}`;
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    };
};
