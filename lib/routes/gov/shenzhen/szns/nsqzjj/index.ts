import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.szns.gov.cn/nsqzjj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '15153', title: '政府信息公开指南' },
    // { id: '15155', title: '政府信息公开工作年度报告' },
    // { id: '22109', title: '公开目录' },
    // { id: '22110', title: '公开目录 - 主动公开目录' },
    // { id: '15156', title: '机构职能' },
    // { id: '15166', title: '机构职能 - 主要职能' },
    // { id: '15167', title: '机构职能 - 机构领导' },
    // { id: '15165', title: '机构职能 - 内设机构' },
    // { id: '15164', title: '机构职能 - 直属机构' },
    { id: '15169', title: '政策文件及解读' },
    { id: '15160', title: '规划计划' },
    { id: '15176', title: '规划计划 - 工作计划及总结' },
    { id: '22112', title: '数据发布' },
    { id: '15158', title: '资金信息' },
    { id: '15170', title: '资金信息 - 部门财政预决算' },
    { id: '15171', title: '资金信息 - “三公”经费' },
    { id: '22231', title: '住房服务' },
    { id: '22234', title: '住房服务 - 项目分配及退出公告' },
    { id: '22235', title: '住房服务 - 施工许可' },
    { id: '22236', title: '住房服务 - 竣工验收备案' },
    { id: '26295', title: '住房服务 - 物业管理' },
    { id: '15162', title: '通知公告' },
    // { id: '15161', title: '联系方式' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/szns/nsqzjj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/szns/nsqzjj/15162',
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
            source: ['www.szns.gov.cn/nsqzjj/gkmlpt/index'],
        },
    ],
    name: '南山区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                      |
| ----- | ----------------------------- |
| 0     | 全部                          |
| 15169 | 政策文件及解读                |
| 15160 | 规划计划                      |
| 15176 | 规划计划 - 工作计划及总结     |
| 22112 | 数据发布                      |
| 15158 | 资金信息                      |
| 15170 | 资金信息 - 部门财政预决算     |
| 15171 | 资金信息 - “三公” 经费        |
| 22231 | 住房服务                      |
| 22234 | 住房服务 - 项目分配及退出公告 |
| 22235 | 住房服务 - 施工许可           |
| 22236 | 住房服务 - 竣工验收备案       |
| 26295 | 住房服务 - 物业管理           |
| 15162 | 通知公告                      |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#nan-shan-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市南山区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        language: 'zh-CN',
    };
}
