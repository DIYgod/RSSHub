import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szgm.gov.cn/gmzfhjsjcsgx';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '11174', title: '政府信息公开指南' },
    // { id: '11175', title: '政府信息依申请公开' },
    // { id: '11168', title: '机构职责' },
    // { id: '11177', title: '机构职责 - 主要职责' },
    // { id: '11178', title: '机构职责 - 机构领导' },
    // { id: '11179', title: '机构职责 - 机构设置' },
    // { id: '11167', title: '机构职责 - 联系方式' },
    { id: '11169', title: '政策法规' },
    { id: '11180', title: '政策法规 - 政策法规及规范性文件' },
    { id: '11170', title: '规划计划' },
    { id: '11181', title: '规划计划 - 年度工作计划及总结' },
    { id: '11171', title: '财政信息' },
    { id: '11182', title: '财政信息 - 部门预决算' },
    { id: '11172', title: '政务服务' },
    { id: '11173', title: '其他' },
    { id: '11184', title: '其他 - 通知公告' },
    // { id: '11176', title: '政府信息公开工作年度报告' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szgm/gmzfhjsjcsgx/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szgm/gmzfhjsjcsgx/11184',
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
            source: ['www.szgm.gov.cn/gmzfhjsjcsgx/gkmlpt/index'],
        },
    ],
    name: '光明区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                        |
| ----- | ------------------------------- |
| 0     | 全部                            |
| 11169 | 政策法规                        |
| 11180 | 政策法规 - 政策法规及规范性文件 |
| 11170 | 规划计划                        |
| 11181 | 规划计划 - 年度工作计划及总结   |
| 11171 | 财政信息                        |
| 11182 | 财政信息 - 部门预决算           |
| 11172 | 政务服务                        |
| 11173 | 其他                            |
| 11184 | 其他 - 通知公告                 |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#guang-ming-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市光明区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        language: 'zh-CN',
    };
}
