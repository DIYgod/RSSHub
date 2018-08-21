const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const rid = ctx.params.rid || '0';
    const day = ctx.params.day || '3';

    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp&rid=${rid}&day=${day}&type=1&arc_type=0&callback=__jp0`,
        headers: {
            Referer: `https://www.bilibili.com/ranking/all/${rid}/0/${day}`,
        },
    });

    const data = JSON.parse(response.data.match(/^__jp0\((.*)\)$/)[1]).data || {};
    let list = data.list || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].others && list[i].others.length) {
            list[i].others.forEach((item) => {
                item.author = list[i].author;
            });
            list = list.concat(list[i].others);
        }
    }

    ctx.state.data = {
        title: `bilibili ${day}日排行榜-${rid}`,
        link: `https://www.bilibili.com/ranking/all/${rid}/0/${day}`,
        item: list.map((item) => ({
            title: item.title,
            description: `作者：${item.author}<br>播放量：${item.play}<br>时长：${item.duration}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
            link: `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
};
