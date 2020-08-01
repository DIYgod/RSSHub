const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const rid = ctx.params.rid || '0';
    const day = ctx.params.day || '3';
    const arc_type = ctx.params.arc_type || '1';
    const disableEmbed = ctx.params.disableEmbed;
    const arc_type1 = arc_type === '0' ? '全部投稿' : '近期投稿';
    const rid_1 = ['0', '1', '168', '3', '129', '4', '36', '188', '160', '119', '155', '5', '181'];
    const rid_2 = ['全站', '动画', '国创相关', '音乐', '舞蹈', '游戏', '科技', '数码', '生活', '鬼畜', '时尚', '娱乐', '影视'];
    const rid_i = rid_1.indexOf(rid + '');
    const rid_type = rid_2[rid_i];
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp&rid=${rid}&day=${day}&type=1&arc_type=${arc_type}&callback=__jp0`,
        headers: {
            Referer: `https://www.bilibili.com/ranking/all/${rid}/${arc_type}/${day}`,
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
        title: `bilibili ${day}日排行榜-${rid_type}-${arc_type1}`,
        link: `https://www.bilibili.com/ranking/all/${rid}/0/${day}`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.description || item.title}${!disableEmbed ? `<br><br>${utils.iframe(item.aid, null, item.bvid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: item.create && new Date(item.create).toUTCString(),
            author: item.author,
            link: !item.create || (new Date(item.create) / 1000 > utils.bvidTime && item.bvid) ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
};
