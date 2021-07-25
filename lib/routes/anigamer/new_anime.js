const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://ani.gamer.com.tw';
    const { new_anime } = await got.get('https://api.gamer.com.tw/mobile_app/anime/v1/index.php').then((r) => r.data);
    ctx.state.data = {
        title: '動畫瘋最後更新',
        link: `${rootUrl}/`,
        item: new_anime.date.map((item) => {
            const date = item.info.split(' ')[0];
            return {
                title: `${item.title} ${item.info.split(' ')[2]}`,
                description: `<img src="${item.cover}">`,
                link: `${rootUrl}/animeVideo.php?sn=${item.video_sn}`,
                pubDate: parseDate(date, 'MM/DD'),
            };
        }),
    };
};
