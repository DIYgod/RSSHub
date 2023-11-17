const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://bgm.tv/anime';
    const response = await got({
        url,
        method: 'get',
        headers: {
            'User-Agent': 'RSSHub (https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua)',
        },
    });

    const rankList = [];
    const $ = cheerio.load(response.body);

    // mediumImageChart
    $('#columnB > div:nth-child(4) > table > tbody')
        .find('tr')
        .each(function () {
            const aTag = $(this).children('td').next().find('a');
            rankList.push({
                title: aTag.html(),
                link: 'https://bgm.tv' + aTag.attr('href'),
            });
        });

    // chl_subitem
    $('#chl_subitem > ul')
        .find('li')
        .each(function () {
            rankList.push({
                title: $(this).children('a').attr('title'),
                link: 'https://bgm.tv' + $(this).children('a').attr('href'),
            });
        });

    const items = rankList.map((item) => ({
        title: item.title,
        link: item.link,
    }));
    ctx.state.data = {
        title: 'Bangumi 成员关注动画榜',
        link: url,
        item: items,
        description: `Bangumi 首页-成员关注动画榜`,
    };
};
