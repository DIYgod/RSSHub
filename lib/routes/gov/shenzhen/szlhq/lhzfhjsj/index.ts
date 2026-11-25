import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szlhq.gov.cn/lhzfhjsj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '14128', title: '政府信息公开指南' },
    // { id: '14129', title: '政府信息依申请公开' },
    // { id: '14130', title: '政府信息公开工作年度报告' },
    // { id: '26828', title: '主动公开目录' },
    // { id: '14133', title: '机构职能' },
    // { id: '14144', title: '机构职能 - 机构概况' },
    // { id: '14142', title: '机构职能 - 机构领导' },
    // { id: '14143', title: '机构职能 - 内设机构' },
    // { id: '14145', title: '机构职能 - 直属机构' },
    // { id: '14146', title: '机构职能 - 联系方式' },
    { id: '14134', title: '政策法规' },
    { id: '14148', title: '政策法规 - 政策文件及解读' },
    { id: '14135', title: '规划计划' },
    { id: '14149', title: '规划计划 - 年度工作计划及总结' },
    // { id: '14139', title: '业务工作' },
    // { id: '14162', title: '业务工作 - 燃气管理' },
    // { id: '14178', title: '业务工作 - 燃气管理 - 燃气供应站' },
    { id: '14132', title: '资金信息' },
    { id: '14140', title: '资金信息 - 财政预决算' },
    { id: '14136', title: '其他' },
    { id: '14152', title: '其他 - 工作动态' },
    { id: '14151', title: '其他 - 通知公告' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szlhq/lhzfhjsj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szlhq/lhzfhjsj/14151',
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
            source: ['www.szlhq.gov.cn/lhzfhjsj/gkmlpt/index'],
        },
    ],
    name: '龙华区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                      |
| ----- | ----------------------------- |
| 0     | 全部                          |
| 14134 | 政策法规                      |
| 14148 | 政策法规 - 政策文件及解读     |
| 14135 | 规划计划                      |
| 14149 | 规划计划 - 年度工作计划及总结 |
| 14132 | 资金信息                      |
| 14140 | 资金信息 - 财政预决算         |
| 14136 | 其他                          |
| 14152 | 其他 - 工作动态               |
| 14151 | 其他 - 通知公告               |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#long-hua-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市龙华区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.szlhq.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
