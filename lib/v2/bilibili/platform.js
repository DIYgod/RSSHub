/*
 * @Author: nightmare-mio wanglongwei2009@qq.com
 * @Date: 2023-11-24 22:51:19
 * @LastEditTime: 2023-11-25 01:05:33
 * @Description:
 */
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { area = -1, p_type = '全部类型', uid } = ctx.params;
    const cookie = config.bilibili.cookies[uid];
    const link = 'https://show.bilibili.com/api/ticket/project/listV2';

    const headers =
        cookie === undefined
            ? {
                  Referer: `https://space.bilibili.com`,
              }
            : {
                  Referer: `https://space.bilibili.com`,
                  Cookie: `SESSDATA=${cookie}`,
              };

    const { data: response } = await got({
        method: 'get',
        url: `${link}?version=134&page=1&pagesize=16&area=${area}&filter=&platform=web&p_type=${p_type}`,
        headers,
    });
    // 列表
    const list = response.data.result;

    const items = list.map((item) => {
        const body_html = `<img src="${item.cover}"/>`;
        const coordinate = `<div>活动地点: ${item.city} ${item.venue_name}</div>`;
        const live_time = `<div>活动时间: ${item.tlabel}</div>`;
        const staff = `<div>参展览嘉宾: ${item.staff}</div>`;
        const countdown = `<div>结束日期: ${item.countdown}</div>`;
        const price = `<div>最低价: ${item.price_low / 100} ; 最高价: ${item.price_high / 100}</div>`;
        return {
            title: item.project_name,
            link: item.url,
            description: body_html + coordinate + live_time + staff + countdown + price,
            pubDate: parseDate(new Date(item.sale_start_time * 1000)),
        };
    });

    ctx.state.data = {
        title: 'bilibili会员购票务',
        link,
        item: items,
    };
};
