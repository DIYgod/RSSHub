// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import randUserAgent from '@/utils/rand-user-agent';

const UA = randUserAgent({ browser: 'chrome', os: 'android', device: 'mobile' });

export default async (ctx) => {
    const id = ctx.req.param('id');
    const url = 'https://xueqiu.com/p/' + id;

    const response = await got(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const data = response.data;
    const pattern = /SNB.cubeInfo = {(.+)}/;
    const info = pattern.exec(data);
    const obj = JSON.parse('{' + info[1] + '}');
    const rebalancing_histories = obj.sell_rebalancing.rebalancing_histories;
    const snb_title = obj.name + ' 的调仓历史';
    const snb_description = obj.description;

    const title = obj.name + ' 的上一笔调仓';
    let description = '';
    for (const some_detail of rebalancing_histories) {
        const prev_weight_adjusted = some_detail.prev_weight_adjusted ?? 0;
        description += some_detail.stock_name + ' from ' + prev_weight_adjusted + ' to ' + some_detail.target_weight + '，\n';
    }
    const time = obj.sell_rebalancing.updated_at;

    const single = {
        title,
        description,
        pubDate: parseDate(time),
        link: url,
        guid: `xueqiu::snb::${id}::${time}`,
    };

    ctx.set('data', {
        title: snb_title,
        link: url,
        description: snb_description,
        item: [single],
    });
};
