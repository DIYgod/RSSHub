import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { PRESETS } from '@/utils/header-generator';

export const route: Route = {
    path: '/snb/:id',
    categories: ['finance'],
    example: '/xueqiu/snb/ZH1288184',
    parameters: { id: '组合代码, 可在组合主页 URL 中找到.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/P/:id', 'xueqiu.com/p/:id'],
        },
    ],
    name: '组合最新调仓信息',
    maintainers: ['ZhishanZhang'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = 'https://xueqiu.com/p/' + id;

    const response = await got(url, {
        headerGeneratorOptions: PRESETS.MODERN_ANDROID,
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

    return {
        title: snb_title,
        link: url,
        description: snb_description,
        item: [single],
    };
}
