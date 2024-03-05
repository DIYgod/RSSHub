// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export default async (ctx) => {
    const { area = -1, type = '全部类型', uid } = ctx.req.param();
    const cookie = config.bilibili.cookies[uid];
    const link = 'https://show.bilibili.com/api/ticket/project/listV2';

    const headers = {
        Referer: 'https://space.bilibili.com',
        Cookie: cookie ? `SESSDATA=${cookie}` : undefined,
    };

    const { data: response } = await got({
        method: 'get',
        url: `${link}?version=134&page=1&pagesize=16&area=${area}&filter=&platform=web&p_type=${type}`,
        headers,
    });
    // 列表
    const list = response.data.result;

    const items = list.map((item) => {
        const bodyHtml = `<img src="${item.cover}"></img>`;
        const coordinate = `<div>活动地点: ${item.city} ${item.venue_name}</div>`;
        const liveTime = `<div>活动时间: ${item.tlabel}</div>`;
        const staff = `<div>参展览嘉宾: ${item.staff}</div>`;
        const countdown = `<div>结束日期: ${item.countdown}</div>`;
        const price = `<div>最低价: ${item.price_low / 100} ; 最高价: ${item.price_high / 100}</div>`;
        return {
            title: item.project_name,
            link: item.url,
            description: bodyHtml + coordinate + liveTime + staff + countdown + price,
            pubDate: parseDate(item.sale_start_time * 1000),
        };
    });

    ctx.set('data', {
        title: `bilibili会员购票务-${area}`,
        link,
        item: items,
    });
};
