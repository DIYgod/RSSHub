const got = require('@/utils/got');
module.exports = async (ctx) => {
    const category = ctx.params.category ? ctx.params.category : 'drama';
    const IdMaps = {
        drama: 1,
        manhua: '2',
        music: '3',
        podcast: '4',
        book: '5',
    };
    const id = IdMaps[category];
    const name = ['广播剧', '有声漫画', '音乐', '播客', '有声书'];
    const dramaUrl = `https://api.kilamanbo.com/api/v433/radio/drama/aggregation/content?pageSize=20&pageNo=1&categoryId=${id}&sort=2&labelId=0&payType=0&endStatus=0&sign=`;
    const res = await got(dramaUrl);

    const items = await Promise.all(
        res.data.b.radioDramaRespList.map((item) =>
            ctx.cache.tryGet(`https://api.kilamanbo.com/api/v433/radio/drama/detail?radioDramaId=${item.radioDramaIdStr}&fromPage=0&sign=`, async () => {
                const soundResponse = await got({
                    method: 'get',
                    url: `https://api.kilamanbo.com/api/v433/radio/drama/detail?radioDramaId=${item.radioDramaIdStr}&fromPage=0&sign=`,
                });
                const soundData = soundResponse.data.b;
                return {
                    title: item.title + ' 更新至 ' + soundData.lastSetTitle,
                    author: soundData.ownerResp.nickname,
                    link: `https://manbo.kilakila.cn/manbo/pc/detail?id=${item.radioDramaIdStr}`,
                    description: `<img src=${soundData.coverPic}><br>  更新至 ${soundData.lastSetTitle}<br>${soundData.desc}`,
                    pubDate: new Date(soundData.updateTime).toUTCString(),
                };
            })
        )
    );

    ctx.state.data = {
        title: '克拉漫播-最新' + name[id - 1],
        link: `https://manbo.hongdoulive.com`,
        item: items,
    };
};
