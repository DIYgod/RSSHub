import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { GkmlptCategory } from '@/routes/gov/shenzhen/gkmlpt/types';
import { buildCategoryMap, buildOptions, defaultOption, getArticleDataItems, getArticleList, getCategoryLink } from '@/routes/gov/shenzhen/gkmlpt/utils';
import type { Data, Route } from '@/types';

const baseUrl = 'https://www.baoan.gov.cn/bajshej';

// Titles come from the platform's left-side directory tree (`window._CONFIG.TREE`), with
// ancestors joined by ` - `. Nodes with an external `jump_url` are skipped. The order
// below follows the tree.
const sections: GkmlptCategory[] = [
    { id: '0', title: '全部' },
    // { id: '5442', title: '政府信息公开指南' },
    // { id: '5444', title: '政府信息依申请公开' },
    // { id: '22350', title: '政策' },
    // { id: '5439', title: '政策 - 政策法规' },
    // { id: '5440', title: '政策 - 政策解读' },
    // { id: '5435', title: '机构职能' },
    // { id: '5447', title: '机构职能 - 机构概况' },
    // { id: '5448', title: '机构职能 - 机构领导' },
    // { id: '5449', title: '机构职能 - 内设机构' },
    // { id: '5451', title: '机构职能 - 事业单位' },
    { id: '24748', title: '规划计划' },
    { id: '5436', title: '规划计划 - 工作计划及总结' },
    { id: '24749', title: '规划计划 - 法治政府建设报告' },
    { id: '24750', title: '财政审计' },
    { id: '5437', title: '财政审计 - 财政预决算' },
    { id: '24751', title: '财政审计 - 审计问题整改报告' },
    { id: '26118', title: '建议提案' },
    { id: '26119', title: '建议提案 - 人大建议答复' },
    { id: '25125', title: '建议提案 - 政协提案答复' },
    { id: '5438', title: '信息发布' },
    { id: '22353', title: '政务服务' },
    { id: '22378', title: '政民互动' },
    { id: '22379', title: '政民互动 - 征集调查' },
    { id: '22380', title: '政民互动 - 留言统计' },
    { id: '22381', title: '政民互动 - 业务知识库' },
    { id: '22377', title: '信用信息双公示' },
    { id: '22362', title: '其他法定公开内容' },
    { id: '5445', title: '其他法定公开内容 - 通知公告' },
    { id: '5446', title: '其他法定公开内容 - 工作动态' },
    // { id: '22836', title: '监督渠道及联系方式' },
    // { id: '20052', title: '政府信息公开制度' },
    // { id: '5443', title: '政府信息公开工作年度报告' },
];

const config = buildCategoryMap(sections);

const options = buildOptions(sections);

export const route: Route = {
    path: '/baoan/bajshej/:caty?',
    categories: ['government'],
    example: '/gov/shenzhen/baoan/bajshej/5445',
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
            source: ['www.baoan.gov.cn/bajshej/gkmlpt/index'],
        },
    ],
    name: '宝安区住房和建设局',
    maintainers: ['nuomi1'],
    handler,
    description: `| caty  | 信息类别                    |
| ----- | --------------------------- |
| 0     | 全部                        |
| 24748 | 规划计划                    |
| 5436  | 规划计划 - 工作计划及总结   |
| 24749 | 规划计划 - 法治政府建设报告 |
| 24750 | 财政审计                    |
| 5437  | 财政审计 - 财政预决算       |
| 24751 | 财政审计 - 审计问题整改报告 |
| 26118 | 建议提案                    |
| 26119 | 建议提案 - 人大建议答复     |
| 25125 | 建议提案 - 政协提案答复     |
| 5438  | 信息发布                    |
| 22353 | 政务服务                    |
| 22378 | 政民互动                    |
| 22379 | 政民互动 - 征集调查         |
| 22380 | 政民互动 - 留言统计         |
| 22381 | 政民互动 - 业务知识库       |
| 22377 | 信用信息双公示              |
| 22362 | 其他法定公开内容            |
| 5445  | 其他法定公开内容 - 通知公告 |
| 5446  | 其他法定公开内容 - 工作动态 |`,
};

async function handler(ctx: Context): Promise<Data> {
    const caty = ctx.req.param('caty') ?? defaultOption;
    const cfg = config.get(caty);

    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/gov/shenzhen#bao-an-qu-zhu-fang-he-jian-she-ju">docs</a>');
    }

    const articles = await getArticleList(baseUrl, cfg.id);
    const items = getArticleDataItems(articles);

    return {
        title: `深圳市宝安区住房和建设局 - ${cfg.title}`,
        link: getCategoryLink(baseUrl, cfg),
        item: items,
        image: 'https://www.baoan.gov.cn/favicon.ico',
        language: 'zh-CN',
    };
}
