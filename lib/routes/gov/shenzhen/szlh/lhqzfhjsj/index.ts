import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szlh.gov.cn/lhqzfhjsj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '12576', title: '政府信息公开指南' },
    // { id: '12575', title: '政府信息公开年报' },
    // { id: '24738', title: '公开目录' },
    // { id: '24739', title: '公开目录 - 主动公开目录' },
    // { id: '24740', title: '公开目录 - 政务公开事项目录' },
    // { id: '12569', title: '机构职能' },
    // { id: '12571', title: '机构职能 - 机构领导' },
    // { id: '12589', title: '机构职能 - 机构概况' },
    // { id: '12581', title: '机构职能 - 内设机构' },
    // { id: '24326', title: '机构职能 - 直属事业单位' },
    { id: '12570', title: '政策文件' },
    { id: '12588', title: '通知公告' },
    { id: '24781', title: '规划计划' },
    { id: '12563', title: '规划计划 - 计划总结' },
    { id: '24573', title: '规划计划 - 法治政府建设报告' },
    { id: '19703', title: '行政执法' },
    { id: '12583', title: '行政执法 - “双随机、一公开”' },
    { id: '12567', title: '资金信息' },
    { id: '12591', title: '资金信息 - 财政预算决算' },
    { id: '12578', title: '资金信息 - “三公”经费' },
    { id: '12574', title: '征集调查' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szlh/lhqzfhjsj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szlh/lhqzfhjsj/12588',
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
            source: ['www.szlh.gov.cn/lhqzfhjsj/gkmlpt/index'],
        },
    ],
    name: '罗湖区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                    |
| ----- | --------------------------- |
| 0     | 全部                        |
| 12570 | 政策文件                    |
| 12588 | 通知公告                    |
| 24781 | 规划计划                    |
| 12563 | 规划计划 - 计划总结         |
| 24573 | 规划计划 - 法治政府建设报告 |
| 19703 | 行政执法                    |
| 12583 | 行政执法 - “双随机、一公开” |
| 12567 | 资金信息                    |
| 12591 | 资金信息 - 财政预算决算     |
| 12578 | 资金信息 - “三公” 经费      |
| 12574 | 征集调查                    |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#luo-hu-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市罗湖区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.szlh.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
