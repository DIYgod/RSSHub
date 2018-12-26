const axios = require('../../utils/axios');
const { DateTime } = require('luxon');

module.exports = async (ctx) => {
    const { new_anime } = await axios.get('https://api.gamer.com.tw/mobile_app/anime/v1/index.php').then((r) => r.data);
    ctx.state.data = {
        title: '動畫瘋最後更新',
        link: 'https://ani.gamer.com.tw/',
        item: new_anime.date.map((item) => ({
            title: item.title,
            description: item.info,
            link: `https://ani.gamer.com.tw/animeRef.php?sn=${item.anime_sn}`,
            pubDate: DateTime.fromFormat(item.info.split(' ')[0], 'mm/dd').toRFC2822(),
        })),
    };
};
