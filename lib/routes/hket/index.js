const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const categories = {
    sran001: {
        baseUrl: `https://inews.hket.com`,
        link: `https://inews.hket.com/sran001/全部`,
        title: '全部',
    },
    sran008: {
        baseUrl: `https://inews.hket.com`,
        description: '財經新聞, 地產資訊',
        link: `https://inews.hket.com/sran008/財金`,
        title: '財經地產',
    },
    sran010: {
        baseUrl: `https://inews.hket.com`,
        description: '科技資訊',
        link: `https://inews.hket.com/sran010/科技`,
        title: '科技',
    },
    sran011: {
        baseUrl: `https://inews.hket.com`,
        description: '國際形勢',
        link: `https://inews.hket.com/sran011/國際`,
        title: '國際',
    },
    srac002: {
        baseUrl: `https://china.hket.com`,
        description: '中國及台灣新聞',
        link: `https://china.hket.com/srac002/即時中國`,
        title: '兩岸',
    },
    srat006: {
        baseUrl: `https:///topick.hket.com`,
        description: '香港新聞, 時事',
        link: `https://topick.hket.com/srat006/新聞`,
        title: '香港',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'sran001';
    const cat = categories[category];

    const response = await ctx.cache.tryGet(cat.link, async () => {
        const resp = await got({
            method: 'get',
            url: cat.link,
            header: {
                Referer: `https://www.hket.com/`,
            },
        });
        return resp.data;
    });

    const $ = cheerio.load(response);

    const list = $('div.listing-title > a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: item.attr('href').startsWith('/')
                    ? // remove tracking parameters
                      cat.baseUrl + item.attr('href').split('?')[0].substring(0, item.attr('href').lastIndexOf('/'))
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
                        header: {
                            Referer: cat.link,
                        },
                    });
                    const content = cheerio.load(article.data);
                    const categories = [];

                    // extract categories
                    content('.contentTags-container > .hotkey-container-wrapper > .hotkey-container > a').each((_, e) => {
                        categories.push(content(e).text().trim());
                    });

                    // remove unwanted elements
                    content('#ad_MobileInArticle, #ad_MobileMain, #Native01, #Native02, #Native03').remove();
                    content('div.template-default.hket-row.detail-widget.show-xs-img.relatedContents-container').remove();
                    content('div.template-default.hket-row.no-padding.detail-widget').remove();
                    content('div.contentTags-container').remove();
                    content('div.gallery-related-container').remove();
                    content('div.article-details-center-sharing-btn').remove();
                    content('source').remove();
                    content('span').each((_, e) => {
                        if (content(e).text().startsWith('+')) {
                            content(e).remove();
                        }
                    });

                    // fix lazyload image
                    content('img').each((_, e) => {
                        content(e).after(`<img src="${content(e).attr('data-src')}" alt="${content(e).attr('data-alt')}">`);
                        content(e).remove();
                    });

                    item.category = categories;
                    item.description = content('div.article-detail-body-container').html();
                    item.pubDate = timezone(parseDate(content('.article-details-info-container_date').text().trim()), +8);

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: `${cat.title}新聞RSS - 香港經濟日報 hket.com`,
        link: cat.link,
        description: `訂閱${cat.title}新聞RSS，獲取最新${cat.description} - RSS - 香港經濟日報 hket.com`,
        item: items,
        language: 'zh-hk',
    };
};
