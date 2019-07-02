const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { new_anime } = await got.get('https://api.gamer.com.tw/mobile_app/anime/v1/index.php').then((r) => r.data);
    ctx.state.data = {
        title: '動畫瘋最後更新',
        link: 'https://ani.gamer.com.tw/',
        item: new_anime.date.map((item) => {
            const date = new Date();
            const month = item.info.split('/')[0] - 1;
            const day = item.info.split(' ')[0].split('/')[1];
            const pubdatetemp = new Date(date.getFullYear(), month, day);
            const pubdate = pubdatetemp > date ? new Date(date.getFullYear() - 1, month, day) : pubdatetemp;

            return {
                title: item.title,
                description: item.info,
                link: `https://ani.gamer.com.tw/animeRef.php?sn=${item.anime_sn}`,
                pubDate: pubdate.toUTCString(),
            };
        }),
    };
};
