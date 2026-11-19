import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szpsq.gov.cn/pszfbzzx';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '16826', title: '政府信息公开指南' },
    // { id: '16827', title: '政府信息依申请公开' },
    // { id: '22796', title: '公开目录' },
    // { id: '22797', title: '公开目录 - 主动公开基本目录' },
    // { id: '16832', title: '机构职能' },
    // { id: '16839', title: '机构职能 - 机构概况' },
    // { id: '16838', title: '机构职能 - 机构领导' },
    // { id: '16840', title: '机构职能 - 内设机构' },
    { id: '16836', title: '工作动态' },
    { id: '16835', title: '通知公告' },
    { id: '16841', title: '规划计划' },
    { id: '16834', title: '资金信息' },
    // { id: '19937', title: '政府信息公开年报' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szpsq/pszfbzzx/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szpsq/pszfbzzx/16835',
    parameters: { caty: { description: '信息类别', options, default: defaultOption } },
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
            source: ['www.szpsq.gov.cn/pszfbzzx/gkmlpt/index'],
        },
    ],
    name: '坪山区住房保障中心',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别 |
| ----- | -------- |
| 0     | 全部     |
| 16836 | 工作动态 |
| 16835 | 通知公告 |
| 16841 | 规划计划 |
| 16834 | 资金信息 |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#ping-shan-qu-zhu-fang-bao-zhang-zhong-xin">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市坪山区住房保障中心 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        language: 'zh-CN',
    };
}
