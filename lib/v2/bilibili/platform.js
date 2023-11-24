/*
 * @Author: nightmare-mio wanglongwei2009@qq.com
 * @Date: 2023-11-24 22:51:19
 * @LastEditTime: 2023-11-24 23:39:31
 * @Description:
 */
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { area = -1, p_type = '全部类型' } = ctx.params;
    const link = 'https://show.bilibili.com/api/ticket/project/listV2';
    const { data: response } = await got(`${link}?version=134&page=1&pagesize=16&area=${area}&filter=&platform=web&p_type=${p_type}`);
    // 列表
    const list = response.data.result;

    const items = list.map((item) => {
        const body_html = `<img src="${item.cover}"/>`;
        const coordinate = `<div>坐标: ${item.city} ${item.venue_name}</div>`;
        const live_time = `<div>活动时间: ${item.tlabel}</div>`;
        return {
            // 文章标题
            title: item.project_name,
            // 文章链接
            link: item.url,
            // 文章正文
            description: body_html + coordinate + live_time,
            // 售卖开始时间
            pubDate: item.sale_start_time,
        };
    });

    ctx.state.data = {
        title: 'bilibili会员购票务',
        link,
        item: items,
    };
};
