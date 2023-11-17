const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://bgm.tv/anime';
    const TRUE_UA = 'RSSHub/1.0 (+http://github.com/DIYgod/RSSHub; like FeedFetcher-Google)'; 
    const response = await got({
        url,
        method: 'get',
        headers: {
            'User-Agent': TRUE_UA,
        },
    });

    const $ = cheerio.load(response.body);

    const items = $('#columnB > div:nth-child(4) > table > tbody')
        .find('tr')
        .toArray()
        .map((item) => {
            const aTag = $(item).children('td').next().find('a');
            return {
                title: aTag.html(),
                link: 'https://bgm.tv' + aTag.attr('href'),
            };
        })
        .concat(
            $('#chl_subitem > ul')
                .find('li')
                .toArray()
                .map((item) => ({
                    titile: $(item).children('a').attr('title'),
                    link: 'https://bgm.tv' + $(item).children('a').attr('href'),
                }))
        );

    ctx.state.data = {
        title: 'Bangumi 成员关注动画榜',
        link: url,
        item: items,
        description: `Bangumi 首页-成员关注动画榜`,
    };
};
