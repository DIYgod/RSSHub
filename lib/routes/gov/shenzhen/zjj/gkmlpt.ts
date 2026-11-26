import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://zjj.sz.gov.cn';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '1993', title: '政府信息公开指南' },
    // { id: '1992', title: '政府信息公开年报' },
    // { id: '1994', title: '机构职能' },
    // { id: '2016', title: '机构职能 - 机构概况' },
    // { id: '2017', title: '机构职能 - 机构领导' },
    // { id: '2018', title: '机构职能 - 内设机构' },
    // { id: '2019', title: '机构职能 - 直属机构' },
    // { id: '1995', title: '政策' },
    // { id: '2020', title: '政策 - 规范性文件' },
    // { id: '25157', title: '政策 - 其他文件' },
    // { id: '27098', title: '政策 - 政策解读' },
    { id: '1996', title: '规划计划' },
    // { id: '1997', title: '政务服务' },
    { id: '1998', title: '数据发布' },
    { id: '2030', title: '数据发布 - 数据统计' },
    { id: '2031', title: '数据发布 - 数据解读' },
    { id: '1999', title: '资金信息' },
    { id: '2033', title: '资金信息 - 财政预决算' },
    { id: '2034', title: '资金信息 - 其他资金信息' },
    { id: '2000', title: '其他' },
    { id: '2036', title: '其他 - 工作动态' },
    { id: '2037', title: '其他 - 通知公告' },
    { id: '2038', title: '其他 - 人事信息' },
    { id: '2039', title: '其他 - 专题专栏' },
    { id: '2001', title: '政府网站工作年度报表' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/zjj/gkmlpt/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/zjj/gkmlpt/2037',
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
            source: ['zjj.sz.gov.cn/gkmlpt/index'],
        },
    ],
    name: '住房和建设局 - 公开目录平台',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty | 信息类别                |
| ---- | ----------------------- |
| 0    | 全部                    |
| 1996 | 规划计划                |
| 1998 | 数据发布                |
| 2030 | 数据发布 - 数据统计     |
| 2031 | 数据发布 - 数据解读     |
| 1999 | 资金信息                |
| 2033 | 资金信息 - 财政预决算   |
| 2034 | 资金信息 - 其他资金信息 |
| 2000 | 其他                    |
| 2036 | 其他 - 工作动态         |
| 2037 | 其他 - 通知公告         |
| 2038 | 其他 - 人事信息         |
| 2039 | 其他 - 专题专栏         |
| 2001 | 政府网站工作年度报表    |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#zhu-fang-he-jian-she-ju-gong-kai-mu-lu-ping-tai">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://zjj.sz.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
