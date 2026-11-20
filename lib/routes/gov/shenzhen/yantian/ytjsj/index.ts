import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.yantian.gov.cn/ytjsj';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    { id: '17730', title: '政策法规' },
    { id: '17741', title: '政策法规 - 法律、法规、规章' },
    // { id: '17724', title: '机构职能' },
    // { id: '17732', title: '机构职能 - 机构概况' },
    // { id: '17734', title: '机构职能 - 机构领导' },
    // { id: '17735', title: '机构职能 - 内设机构' },
    // { id: '17751', title: '机构职能 - 联系方式' },
    { id: '17725', title: '规划计划' },
    { id: '17754', title: '规划计划 - 年度计划与总结' },
    { id: '17726', title: '资金信息' },
    { id: '27388', title: '资金信息 - 财政预算决算' },
    { id: '17727', title: '信息公开年度工作报告' },
    { id: '17728', title: '其他' },
    { id: '17753', title: '其他 - 通知公告' },
    { id: '17729', title: '业务工作' },
    { id: '17731', title: '业务工作 - 工程建设领域信息公开专栏' },
    { id: '17764', title: '业务工作 - 工程建设领域信息公开专栏 - 竣工验收信息' },
    { id: '17761', title: '业务工作 - 工程建设领域信息公开专栏 - 质量安全检查信息' },
    { id: '17760', title: '业务工作 - 工程建设领域信息公开专栏 - 施工管理信息' },
    { id: '17757', title: '业务工作 - 工程建设领域信息公开专栏 - 招标投标信息' },
    { id: '17733', title: '业务工作 - 住房保障信息公开' },
    { id: '17766', title: '业务工作 - 住房保障信息公开 - 住房保障动态' },
    { id: '17765', title: '业务工作 - 住房保障信息公开 - 计划和建设信息' },
    { id: '17762', title: '业务工作 - 住房保障信息公开 - 住房保障政策' },
    // { id: '17745', title: '业务工作 - 建设工程消防设计审查验收工作' },
    { id: '26538', title: '业务工作 - 城市更新和土地整备' },
    { id: '26539', title: '业务工作 - 城市更新和土地整备 - 计划规划' },
    // { id: '25376', title: '政府信息公开指南' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/yantian/ytjsj/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/yantian/ytjsj/17753',
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
            source: ['www.yantian.gov.cn/ytjsj/gkmlpt/index'],
        },
    ],
    name: '盐田区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                                               |
| ----- | ------------------------------------------------------ |
| 0     | 全部                                                   |
| 17730 | 政策法规                                               |
| 17741 | 政策法规 - 法律、法规、规章                            |
| 17725 | 规划计划                                               |
| 17754 | 规划计划 - 年度计划与总结                              |
| 17726 | 资金信息                                               |
| 27388 | 资金信息 - 财政预算决算                                |
| 17727 | 信息公开年度工作报告                                   |
| 17728 | 其他                                                   |
| 17753 | 其他 - 通知公告                                        |
| 17729 | 业务工作                                               |
| 17731 | 业务工作 - 工程建设领域信息公开专栏                    |
| 17764 | 业务工作 - 工程建设领域信息公开专栏 - 竣工验收信息     |
| 17761 | 业务工作 - 工程建设领域信息公开专栏 - 质量安全检查信息 |
| 17760 | 业务工作 - 工程建设领域信息公开专栏 - 施工管理信息     |
| 17757 | 业务工作 - 工程建设领域信息公开专栏 - 招标投标信息     |
| 17733 | 业务工作 - 住房保障信息公开                            |
| 17766 | 业务工作 - 住房保障信息公开 - 住房保障动态             |
| 17765 | 业务工作 - 住房保障信息公开 - 计划和建设信息           |
| 17762 | 业务工作 - 住房保障信息公开 - 住房保障政策             |
| 26538 | 业务工作 - 城市更新和土地整备                          |
| 26539 | 业务工作 - 城市更新和土地整备 - 计划规划               |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#yan-tian-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市盐田区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.yantian.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
