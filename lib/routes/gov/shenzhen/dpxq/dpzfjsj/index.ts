import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.dpxq.gov.cn/dpzfjsj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '18885', title: '政府信息公开指南' },
    // { id: '18884', title: '政府信息依申请公开' },
    // { id: '25063', title: '公开目录' },
    // { id: '25064', title: '公开目录 - 主动公开目录' },
    // { id: '18886', title: '机构职能' },
    // { id: '18892', title: '机构职能 - 机构概况' },
    // { id: '18893', title: '机构职能 - 机构领导' },
    // { id: '18894', title: '机构职能 - 内设机构' },
    // { id: '18895', title: '机构职能 - 直属机构' },
    { id: '18887', title: '规划计划' },
    { id: '18897', title: '规划计划 - 规划计划及总结' },
    { id: '18888', title: '资金信息' },
    { id: '18889', title: '人事信息' },
    { id: '18890', title: '部门动态' },
    // { id: '18891', title: '政府信息公开工作年度报告' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/dpxq/dpzfjsj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/dpxq/dpzfjsj/18890',
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
            source: ['www.dpxq.gov.cn/dpzfjsj/gkmlpt/index'],
        },
    ],
    name: '大鹏新区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                  |
| ----- | ------------------------- |
| 0     | 全部                      |
| 18887 | 规划计划                  |
| 18897 | 规划计划 - 规划计划及总结 |
| 18888 | 资金信息                  |
| 18889 | 人事信息                  |
| 18890 | 部门动态                  |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#da-peng-xin-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市大鹏新区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        language: 'zh-CN',
    };
}
