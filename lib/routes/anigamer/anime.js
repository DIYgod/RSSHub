const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { anime } = await got.get(`https://api.gamer.com.tw/mobile_app/anime/v1/video.php?sn=0&anime_sn=${ctx.params.sn}`).then((r) => r.data);
    ctx.state.data = {
        title: anime.title,
        link: `https://ani.gamer.com.tw/animeRef.php?sn=${anime.anime_sn}`,
        description: `<img src="${anime.cover}"> ` + anime.content.trim(),
        item: anime.volumes[0].map((item) => ({
            title: `${anime.title} 第 ${item.volume} 集`,
            link: `https://ani.gamer.com.tw/animeVideo.php?sn=${item.video_sn}`,
        })),
    };
};
