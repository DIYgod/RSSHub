const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.ibc.co.jp/radio/maitta/audio/';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const items = $('.up').toArray();
    ctx.state.data = {
        title: 'IBCラジオ　イヤーマイッタマイッタ｜IBC岩手放送',
        link: 'http://www.ibc.co.jp/radio/maitta/audio',
        description: $('meta[name=description]').attr('content'),
        itunes_author: '水越アナと大塚アナ',
        image: 'https://cdn.ibc.co.jp/radio/maitta/audio/images/header.png',
        language: 'ja',
        item: items.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), url).href;
            const uid = link.match(/\/(\d+)\/$/)[1];
            return {
                title: item.find('h3').text(),
                description: item.find('.audio_intro').text().trim(),
                link,
                pubDate: parseDate(item.find('.onair_date').text().split('日')[0].replace(/年|月/g, '-')),
                itunes_item_image: 'https://assets.blubrry.com/coverart/300/357155.png',
                enclosure_url: `https://media-data.cdn.ibc.co.jp/out/sound/28_${uid}/28_${uid}.mp3`, // 音频链接
                enclosure_type: 'audio/mpeg',
            };
        }),
    };
};
