const axios = require('../../utils/axios');

const url = 'https://www.ibc.co.jp/radio/maitta/audio/moreitem.php';

module.exports = async (ctx) => {
    const res = await axios.get(url);
    const { items } = res.data;
    ctx.state.data = {
        title: 'IBCラジオ　イヤーマイッタマイッタ｜IBC岩手放送',
        link: 'http://www.ibc.co.jp/radio/maitta/audio',
        description: 'ＩＢＣの名物コンビ水越アナと大塚アナが、リスナーからの投稿「まいった話」を、独特のテイストでゆる～く紹介。\n' + '＜第501回＞からの音声を配信中',
        itunes_author: '水越アナと大塚アナ',
        image: 'https://cdn.ibc.co.jp/radio/maitta/audio/images/og.png',
        language: 'ja',
        item: items.map((item) => ({
            title: item.title,
            description: item.body,
            link: `https:${item.audiourl.split('?')[0]}`,
            pubDate: new Date(item.onair.replace(/年|月/g, '-').replace('日', '')).toUTCString(),
            itunes_item_image: 'https://cdn.ibc.co.jp/radio/maitta/audio/images/og.png',
            enclosure_url: `https:${item.audiourl.split('?')[0]}`, // 音频链接
            enclosure_type: 'audio/mpeg',
        })),
    };
};
