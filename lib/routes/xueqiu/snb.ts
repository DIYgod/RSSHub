import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import { evaluateScriptData } from '@/utils/evaluate-script';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';
import { parseDate } from '@/utils/parse-date';

interface CubeInfo {
    name: string;
    description: string;
    sell_rebalancing?: {
        updated_at: number;
        rebalancing_histories: Array<{ stock_name: string; prev_weight_adjusted?: number; target_weight: number }>;
    };
}

export const route: Route = {
    path: '/snb/:id',
    categories: ['finance'],
    example: '/xueqiu/snb/ZH1288184',
    parameters: { id: '组合代码, 可在组合主页 URL 中找到.' },
    features: {
        requireConfig: [{ name: 'XUEQIU_COOKIES', optional: true, description: '需要登录才能访问的组合请配置雪球登录 Cookie。' }],
        requirePuppeteer: false,
        antiCrawler: true,
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
        headers: { Cookie: config.xueqiu.cookies },
    });

    const $ = load(response.data);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .filter((source) => source.includes('cubeInfo'))
        .join('\n');
    if (!script) {
        throw new Error('The Xueqiu portfolio page does not expose its data. Verify the portfolio ID and set a valid XUEQIU_COOKIES from an account that can view it.');
    }
    const obj = await evaluateScriptData<CubeInfo>(`var SNB = {};\n${script}`, 'SNB.cubeInfo');
    const rebalancing = obj?.sell_rebalancing;
    if (!obj?.name || !rebalancing || !Array.isArray(rebalancing.rebalancing_histories) || !rebalancing.updated_at) {
        throw new Error('The Xueqiu portfolio has no accessible rebalance data. Verify access on Xueqiu and refresh XUEQIU_COOKIES.');
    }
    const snbTitle = obj.name + ' 的调仓历史';
    const snbDescription = obj.description;

    const title = obj.name + ' 的上一笔调仓';
    let description = '';
    for (const detail of rebalancing.rebalancing_histories) {
        const prevWeightAdjusted = detail.prev_weight_adjusted ?? 0;
        description += detail.stock_name + ' from ' + prevWeightAdjusted + ' to ' + detail.target_weight + '，\n';
    }
    const time = rebalancing.updated_at;

    const single = {
        title,
        description,
        pubDate: parseDate(time, 'x'),
        link: url,
        guid: `xueqiu::snb::${id}::${time}`,
    };

    return {
        title: snbTitle,
        link: url,
        description: snbDescription,
        item: [single],
    };
}
