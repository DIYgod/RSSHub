const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const host = `http://android.magi-reco.com`;
    const link = host + `/magica/json/event_banner/event_banner.json`;
    const listData = await got.get(link);
    if (!~listData.headers['content-type'].indexOf('application/json')) {
        ctx.throw(403, 'Server not allow to get announcement.');
    }
    const data = listData.data.slice(-50);
    ctx.state.data = {
        title: '魔法纪录日服 - 游戏横幅',
        link,
        description: 'Popup announcement left event_banner',
        language: 'jp',
        item: data.map((item) => ({
            title: item.description,
            description: item.bannerText + '<br /><img src="' + host + item.imagePath + '_m.png" />',
            pubDate: timezone(parseRelativeDate(item.startAt), 9),
            link: 'https://jp.rika.ren/pop_up.html' + (item.announcementId ? '#id=' + item.announcementId : ''),
            uuid: item.bannerId,
            media: {
                content: {
                    url: host + item.imagePath + '_m.png',
                    type: 'image/png',
                },
                thumbnail: {
                    url: host + item.imagePath + '_a.png',
                },
            },
        })),
    };
};
