const got = require('@/utils/got');

const audio = 'https://www.bilibili.com/audio/au';

module.exports = async (ctx) => {
    const id = Number.parseInt(ctx.params.id);
    const link = `https://www.bilibili.com/audio/am${id}`;

    const apiMenuUrl = `https://www.bilibili.com/audio/music-service-c/web/menu/info?sid=${id}`;
    const menuResponse = await got.get(apiMenuUrl);
    const menuData = menuResponse.data.data;
    const introduction = menuData.intro;
    const title = menuData.title;

    const apiUrl = `https://www.bilibili.com/audio/music-service-c/web/song/of-menu?sid=${id}&pn=1&ps=100`;
    const response = await got.get(apiUrl);
    const data = response.data.data.data;

    const out = data.map((item) => {
        const title = item.title;
        const link = audio + item.statistic.sid;
        const author = item.author;
        const description = item.intro + `<br><img src="${item.cover}">`;

        const single = {
            title,
            link,
            author,
            pubDate: new Date(item.passtime * 1000).toUTCString(),
            description,
        };

        return single;
    });

    ctx.state.data = {
        title,
        link,
        description: introduction,
        item: out,
    };
};
