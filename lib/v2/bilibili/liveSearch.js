const got = require('@/utils/got');
const utils = require('./utils');
const cache = require('./cache');

module.exports = async (ctx) => {
    const key = ctx.params.key;
    const order = ctx.params.order;

    const urlEncodedKey = encodeURIComponent(key);
    let orderTitle = '';

    switch (order) {
        case 'live_time':
            orderTitle = '最新开播';
            break;
        case 'online':
            orderTitle = '人气直播';
            break;
    }
    const verifyString = await cache.getVerifyString(ctx);
    let params = `__refresh__=true&_extra=&context=&page=1&page_size=42&order=${order}&duration=&from_source=&from_spmid=333.337&platform=pc&highlight=1&single_column=0&keyword=${urlEncodedKey}&ad_resource=&source_tag=3&gaia_vtoken=&category_id=&search_type=live&dynamic_offset=0&web_location=1430654`;
    params = utils.addVerifyInfo(params, verifyString);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/wbi/search/type?${params}`,
        headers: {
            Referer: `https://search.bilibili.com/live?keyword=${urlEncodedKey}&from_source=webtop_search&spm_id_from=444.7&search_source=3&search_type=live_room`,
            Cookie: await cache.getCookie(ctx),
        },
    });
    const data = response.data.data.result.live_room;

    ctx.state.data = {
        title: `哔哩哔哩直播-${key}-${orderTitle}`,
        link: `https://search.bilibili.com/live?keyword=${urlEncodedKey}&order=${order}&coverType=user_cover&page=1&search_type=live`,
        description: `哔哩哔哩直播-${key}-${orderTitle}`,
        item:
            data &&
            data.map((item) => ({
                title: `${item.uname} ${item.title} (${item.cate_name}-${item.live_time})`,
                description: `${item.uname} ${item.title} (${item.cate_name}-${item.live_time})`,
                pubDate: new Date(item.live_time.replace(' ', 'T') + '+08:00').toUTCString(),
                guid: `https://live.bilibili.com/${item.roomid} ${item.live_time}`,
                link: `https://live.bilibili.com/${item.roomid}`,
            })),
    };
};
