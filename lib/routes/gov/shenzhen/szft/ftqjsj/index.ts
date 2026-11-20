import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szft.gov.cn/ftqjsj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '9075', title: '政府信息公开指南' },
    // { id: '9093', title: '机构职能' },
    // { id: '9118', title: '机构职能 - 主要职能' },
    // { id: '9117', title: '机构职能 - 领导成员' },
    // { id: '9119', title: '机构职能 - 科室组成' },
    // { id: '9121', title: '机构职能 - 下属单位' },
    // { id: '9115', title: '机构职能 - 政务公开机构' },
    // { id: '9116', title: '机构职能 - 联系方式' },
    { id: '9088', title: '政策法规' },
    { id: '21529', title: '规划计划' },
    { id: '9092', title: '规划计划 - 规划计划及总结' },
    { id: '25940', title: '规划计划 - 法治政府建设报告' },
    { id: '21530', title: '资金信息' },
    { id: '9090', title: '资金信息 - 预决算信息' },
    { id: '9095', title: '资金信息 - “三公”经费' },
    { id: '9077', title: '工作动态' },
    { id: '9084', title: '通知公告' },
    // { id: '9091', title: '政府信息公开年报' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szft/ftqjsj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szft/ftqjsj/9084',
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
            source: ['www.szft.gov.cn/ftqjsj/gkmlpt/index'],
        },
    ],
    name: '福田区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                    |
| ----- | --------------------------- |
| 0     | 全部                        |
| 9088  | 政策法规                    |
| 21529 | 规划计划                    |
| 9092  | 规划计划 - 规划计划及总结   |
| 25940 | 规划计划 - 法治政府建设报告 |
| 21530 | 资金信息                    |
| 9090  | 资金信息 - 预决算信息       |
| 9095  | 资金信息 - “三公” 经费      |
| 9077  | 工作动态                    |
| 9084  | 通知公告                    |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#fu-tian-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市福田区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.szft.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
