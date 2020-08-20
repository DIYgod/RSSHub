const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.ibc.co.jp/radio/maitta/audio/';

module.exports = async (ctx) => {
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const items = $('.broadcast').get();
    ctx.state.data = {
        title: 'IBCラジオ　イヤーマイッタマイッタ｜IBC岩手放送',
        link: 'http://www.ibc.co.jp/radio/maitta/audio',
        description: $('meta[name=description]').attr('content'),
        itunes_author: '水越アナと大塚アナ',
        image: 'https://cdn.ibc.co.jp/radio/maitta/audio/images/og.png',
        language: 'ja',
        item: items.map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                description: item.find('.linecontent').text().trim(),
                link: `https:${item.find('a').first().attr('href').split('?')[0]}`,
                pubDate: new Date(item.find('.onairdate').text().split('日')[0].replace(/年|月/g, '-')).toUTCString(),
                itunes_item_image: 'https://cdn.ibc.co.jp/radio/maitta/audio/images/og.png',
                enclosure_url: `https:${item.find('a').first().attr('href').split('?')[0]}`, // 音频链接
                enclosure_type: 'audio/mpeg',
            };
        }),
    };
};
