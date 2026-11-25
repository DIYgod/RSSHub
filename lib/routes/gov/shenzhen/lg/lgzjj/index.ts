import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.lg.gov.cn/lgzjj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '6665', title: '政府信息公开指南' },
    // { id: '6551', title: '机构设置' },
    // { id: '6612', title: '机构设置 - 机构概况' },
    // { id: '6614', title: '机构设置 - 机构领导' },
    // { id: '6615', title: '机构设置 - 内设机构' },
    // { id: '6613', title: '机构设置 - 直属机构' },
    { id: '6611', title: '年度工作计划及总结' },
    { id: '6609', title: '财政预决算' },
    { id: '23903', title: '人事信息' },
    { id: '23897', title: '重点领域' },
    { id: '23898', title: '重点领域 - 住房保障政策' },
    { id: '23900', title: '重点领域 - 分配和退出信息' },
    // { id: '23901', title: '重点领域 - 网上申请' },
    { id: '23902', title: '重点领域 - 住房保障信息' },
    { id: '6554', title: '其他' },
    { id: '6623', title: '其他 - 工作动态' },
    { id: '6622', title: '其他 - 通知公告' },
    // { id: '6664', title: '政府信息公开年报' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/lg/lgzjj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/lg/lgzjj/6622',
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
            source: ['www.lg.gov.cn/lgzjj/gkmlpt/index'],
        },
    ],
    name: '龙岗区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                  |
| ----- | ------------------------- |
| 0     | 全部                      |
| 6611  | 年度工作计划及总结        |
| 6609  | 财政预决算                |
| 23903 | 人事信息                  |
| 23897 | 重点领域                  |
| 23898 | 重点领域 - 住房保障政策   |
| 23900 | 重点领域 - 分配和退出信息 |
| 23902 | 重点领域 - 住房保障信息   |
| 6554  | 其他                      |
| 6623  | 其他 - 工作动态           |
| 6622  | 其他 - 通知公告           |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#long-gang-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市龙岗区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.lg.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
