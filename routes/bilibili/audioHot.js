const axios = require('../../utils/axios');

const audio = 'https://www.bilibili.com/audio/au';
const apiUrl = 'https://www.bilibili.com/audio/music-service-c/web/song/of-menu?sid=10627&pn=1&ps=100';

module.exports = async (ctx) => {
    const response = await axios.get(apiUrl);
    const data = response.data.data.data;

    const out = data.map((item) => {
        const title = item.title;
        const link = audio + item.statistic.sid;
        const description = item.intro + `<br><img src="${item.cover}">`;

        const single = {
            title: title,
            link: link,
            pubDate: new Date(item.passtime * 1000),
            description: description,
        };

        return single;
    });

    ctx.state.data = {
        title: 'bilibili热歌榜（每日11:00更新）',
        link: 'https://www.bilibili.com/audio/am10627',
        description: '每日上午11:00更新，精选三日内热门投稿作品。',
        item: out,
    };
};
