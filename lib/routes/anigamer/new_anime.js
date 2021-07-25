const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://ani.gamer.com.tw'
    const response = await got.get('https://api.gamer.com.tw/mobile_app/anime/v3/index.php');
    const newAnime = response.data.data.newAnime;
    ctx.state.data = {
        title: '動畫瘋最後更新',
        link: `${rootUrl}/`,
        item: newAnime.date.map((item) => {
            const date = `${item.upTime} ${item.upTimeHours}`;
            return {
                title: `${item.title} ${item.volume}`,
                description: `<img src="${item.cover}">`,
                link: `${rootUrl}/animeVideo.php?sn=${item.video_sn}`,
                pubDate: parseDate(date, 'MM/DD HH:mm'),
            };
        }),
    };
};
