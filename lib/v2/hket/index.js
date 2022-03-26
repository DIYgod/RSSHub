const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const path = require('path');
const { art } = require('@/utils/render');

const urlMap = {
    srac: {
        baseUrl: 'https://china.hket.com',
    },
    sran: {
        baseUrl: 'https://inews.hket.com',
    },
    srat: {
        baseUrl: 'https://topick.hket.com',
    },
    sraw: {
        baseUrl: 'https://wealth.hket.com',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'sran001';
    const baseUrl = urlMap[category.substring(0, 4)].baseUrl;

    const response = await got({
        method: 'get',
        url: baseUrl + '/' + category,
        headers: {
            Referer: 'https://www.hket.com',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('div.listing-title > a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: item.attr('href').startsWith('/')
                    ? // remove tracking parameters
                      baseUrl + item.attr('href').split('?')[0].substring(0, item.attr('href').lastIndexOf('/'))
                    : item.attr('href').split('?')[0].substring(0, item.attr('href').lastIndexOf('/')),
            };
        })
        .get();

    const items = await Promise.all(
        list &&
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const article = await got({
                        method: 'get',
                        url: item.link,
                        headers: {
                            Referer: baseUrl + '/' + category,
                        },
                    });
                    const content = cheerio.load(article.data);

                    // extract categories
                    const categories = content('.contentTags-container > .hotkey-container-wrapper > .hotkey-container > a')
                        .toArray()
                        .map((e) => content(e).text().trim());

                    // remove unwanted elements
                    content('p.adunit').remove();
                    content('p.article-detail_caption').remove();
                    content('div.template-default.hket-row.detail-widget.show-xs-img.relatedContents-container').remove();
                    content('div.template-default.hket-row.no-padding.detail-widget').remove();
                    content('div.gallery-related-container').remove();
                    content('div.contentTags-container').remove();
                    content('div.article-details-center-sharing-btn').remove();
                    content('source').remove();
                    content('span.click-to-enlarge').remove();
                    content('span').each((_, e) => {
                        if (content(e).text().startsWith('+')) {
                            content(e).remove();
                        }
                    });

                    // fix lazyload image and caption
                    content('img').each((_, e) => {
                        e = content(e);
                        e.after(
                            art(path.join(__dirname, 'templates/image.art'), {
                                alt: e.attr('data-alt'),
                                src: e.attr('data-src') ?? e.attr('src'),
                            })
                        );
                        e.remove();
                    });

                    item.category = categories;
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        desc: content('div.article-detail-body-container').html(),
                    });
                    item.pubDate = timezone(parseDate(content('.article-details-info-container_date').text().trim()), +8);

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: String($('head meta[name=title]').attr('content').trim()),
        link: baseUrl + '/' + category,
        description: String($('head meta[name=description]').attr('content').trim()),
        item: items,
        language: 'zh-hk',
    };
};
