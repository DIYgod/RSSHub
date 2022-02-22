const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

const rootUrl = 'https://hk.on.cc';

const languageMap = {
    'zh-hans': '_cn',
    'zh-hant': '',
};

const channelMap = {
    news: {
        'zh-hans': '港澳',
        'zh-hant': '港澳',
    },
    cnnews: {
        'zh-hans': '两岸',
        'zh-hant': '兩岸',
    },
    intnews: {
        'zh-hans': '国际',
        'zh-hant': '國際',
    },
    commentary: {
        'zh-hans': '评论',
        'zh-hant': '評論',
    },
    finance: {
        'zh-hans': '产经',
        'zh-hant': '產經',
    },
};

module.exports = async (ctx) => {
    const language = ctx.params.language;
    const channel = ctx.params.channel ?? 'news';
    const newsUrl = `${rootUrl}/hk/${channel}/index${languageMap[language]}.html`;

    const response = await got.get(newsUrl);
    const $ = cheerio.load(response.data);
    const list = $('#focusNews > div.focusItem[type=article]')
        .map((_, item) => {
            const title = $(item).find('div.focusTitle > span').text();
            const link = rootUrl + $(item).find('a:nth-child(1)').attr('href');
            const pubDate = parseDate($(item).attr('edittime'), 'YYYYMMDDHHmmss');

            return {
                title,
                link,
                pubDate,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(async (item) => {
            const desc = await ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $ = cheerio.load(detailResponse.data);
                const imageUrl = rootUrl + $('img').eq(0).attr('src');
                const content = $('div.breakingNewsContent').html();
                const description = art(path.join(__dirname, 'templates/article.art'), {
                    imageUrl,
                    content,
                });

                return description;
            });
            item.description = desc;

            return item;
        })
    );

    ctx.state.data = {
        title: `東網 - ${channelMap[channel][language]}`,
        link: newsUrl,
        item: items,
    };
};
