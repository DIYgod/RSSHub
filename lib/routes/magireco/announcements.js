const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const host = `http://android.magi-reco.com`;
    const link = host + `/magica/json/announcements/announcements.json`;
    const listData = await got.get(link);
    if (!~listData.headers['content-type'].indexOf('application/json')) {
        ctx.throw(403, 'Server not allow to get announcement.');
    }
    const data = listData.data.slice(-50);
    ctx.state.data = {
        title: '魔法纪录日服 - 游戏公告',
        link,
        description: 'Popup announcement right announcements',
        language: 'jp',
        item: data.map((item) => ({
            title: item.subject,
            categoty: [item.categoty, item.displayOs],
            description: item.text,
            pubDate: timezone(parseRelativeDate(item.startAt), 9),
            link: 'https://jp.rika.ren/pop_up.html#id=' + item.id,
            uuid: item.id,
        })),
    };
};
