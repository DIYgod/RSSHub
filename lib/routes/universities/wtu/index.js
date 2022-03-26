const got = require('@/utils/got');

const apiUrl = 'http://ehall.wtu.edu.cn/wtu/api/queryBulletinListByConditional.do?pageNum=1&pageSize=8&columnId=';
const listUrl = 'http://ehall.wtu.edu.cn/new/list.html?type=';
const psgUrl = 'http://ehall.wtu.edu.cn/new/detail-word.html?';
const map = new Map([
    [1, { title: '通知公告', type: '2', id: '1994a3b58bef4ee887e1efc19881decd' }],
    [2, { title: '教务信息', type: '5', id: '36d47fcd3e774f289adfef1d93138a9d' }],
    [3, { title: '科研动态', type: '3', id: '48e8abfb983b4e4486b69feacad1dc1b' }],
]);

module.exports = async (ctx) => {
    const typein = Number.parseInt(ctx.params.type);
    const title = map.get(typein).title;
    const columnId = map.get(typein).id;
    const type = map.get(typein).type;
    const res = await got({
        method: 'get',
        url: `${apiUrl}${columnId}`,
    });
    const res_json = res.data.bulletinList;

    ctx.state.data = {
        title: `${title} - 武汉纺织大学信息门户`,
        link: `${listUrl}${type}`,
        description: `${title} - 武汉纺织大学信息门户`,
        item: res_json.map((item) => ({
            title: item.TITLE,
            description: item.TITLE,
            pubDate: new Date(item.CREATE_TIME).toUTCString(),
            link: `${psgUrl}type=${type}?bulletinId=${item.WID}`,
        })),
    };
};
